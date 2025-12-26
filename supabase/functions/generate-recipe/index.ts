import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Input validation schema
const RequestSchema = z.object({
  query: z.string().min(1, "Query is required").max(2000, "Query too long"),
  type: z.enum(['generate', 'suggest', 'chat']).default('chat'),
});

// Output validation schema for AI-generated recipes
const IngredientSchema = z.object({
  item: z.string().max(200),
  amount: z.string().max(100),
});

const StepSchema = z.object({
  step: z.number().int().positive(),
  instruction: z.string().max(2000),
  tip: z.string().max(500).optional(),
});

const RecipeSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(1000).optional(),
  prep_time: z.number().int().min(0).max(1440).optional(),
  cook_time: z.number().int().min(0).max(1440).optional(),
  servings: z.number().int().min(1).max(100).optional(),
  difficulty: z.enum(['easy', 'medium', 'hard']).optional(),
  ingredients: z.array(IngredientSchema).max(100),
  steps: z.array(StepSchema).max(100),
  tags: z.array(z.string().max(50)).max(20).optional(),
});

const SuggestionSchema = z.object({
  suggestions: z.array(z.object({
    title: z.string().max(200),
    description: z.string().max(500),
    difficulty: z.enum(['easy', 'medium', 'hard']).optional(),
    time: z.string().max(50).optional(),
  })).max(10),
});

// Sanitize text to remove control characters and potentially dangerous content
function sanitizeText(text: string): string {
  return text
    .replace(/[\u0000-\u001F\u007F-\u009F]/g, '') // Remove control characters
    .trim();
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify authentication - JWT is validated by Supabase when verify_jwt=true
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error('Missing authorization header');
      return new Response(
        JSON.stringify({ error: 'Authentication required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create Supabase client and verify user
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      console.error('Authentication failed:', authError?.message);
      return new Response(
        JSON.stringify({ error: 'Invalid authentication' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Processing recipe generation request for user:', user.id);

    // Parse and validate request body
    let rawBody;
    try {
      rawBody = await req.json();
    } catch (e) {
      console.error('Invalid JSON in request body');
      return new Response(
        JSON.stringify({ error: 'Invalid JSON in request body' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const validation = RequestSchema.safeParse(rawBody);
    if (!validation.success) {
      console.error('Validation failed:', validation.error.errors);
      return new Response(
        JSON.stringify({ error: 'Invalid request parameters', details: validation.error.errors }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { query, type } = validation.data;
    
    // Sanitize query - remove potential injection patterns
    const sanitizedQuery = query
      .replace(/[<>]/g, '') // Remove HTML/XML tags
      .trim()
      .slice(0, 2000); // Hard limit

    console.log(`Processing ${type} request with query length: ${sanitizedQuery.length}`);

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    let systemPrompt = "";
    
    if (type === "generate") {
      systemPrompt = `You are a professional chef and recipe creator. Generate a detailed, delicious recipe based on the user's request. 
      
      ALWAYS respond with valid JSON in this exact format:
      {
        "title": "Recipe Name",
        "description": "A brief, appetizing description of the dish",
        "prep_time": 15,
        "cook_time": 30,
        "servings": 4,
        "difficulty": "easy" | "medium" | "hard",
        "ingredients": [
          { "item": "ingredient name", "amount": "quantity with unit" }
        ],
        "steps": [
          { "step": 1, "instruction": "Detailed instruction for this step", "tip": "Optional helpful tip" }
        ],
        "tags": ["tag1", "tag2"]
      }
      
      Be creative, provide clear instructions, and make the recipe approachable for home cooks.`;
    } else if (type === "suggest") {
      systemPrompt = `You are a helpful culinary assistant. Based on the ingredients or preferences the user mentions, suggest 3-5 recipe ideas they could make.
      
      ALWAYS respond with valid JSON in this exact format:
      {
        "suggestions": [
          {
            "title": "Recipe Name",
            "description": "Brief description",
            "difficulty": "easy" | "medium" | "hard",
            "time": "30 mins"
          }
        ]
      }`;
    } else {
      systemPrompt = `You are a friendly and knowledgeable culinary assistant. Help users with cooking questions, techniques, ingredient substitutions, and food-related queries. Be warm, encouraging, and provide practical advice.`;
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: sanitizedQuery }
        ],
        stream: false,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Usage limit reached. Please add credits." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("No content in AI response");
    }

    // Try to parse and validate JSON from the response
    let parsedContent: unknown = content;
    if (type === "generate" || type === "suggest") {
      try {
        // Extract JSON from markdown code blocks if present
        const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
        const jsonStr = jsonMatch ? jsonMatch[1].trim() : content.trim();
        const rawParsed = JSON.parse(jsonStr);
        
        // Validate and sanitize AI output based on type
        if (type === "generate") {
          const validated = RecipeSchema.parse(rawParsed);
          // Sanitize all text fields
          parsedContent = {
            ...validated,
            title: sanitizeText(validated.title),
            description: validated.description ? sanitizeText(validated.description) : undefined,
            ingredients: validated.ingredients.map(ing => ({
              item: sanitizeText(ing.item),
              amount: sanitizeText(ing.amount),
            })),
            steps: validated.steps.map(step => ({
              ...step,
              instruction: sanitizeText(step.instruction),
              tip: step.tip ? sanitizeText(step.tip) : undefined,
            })),
            tags: validated.tags?.map(tag => sanitizeText(tag)),
          };
          console.log('Recipe validated and sanitized successfully');
        } else if (type === "suggest") {
          const validated = SuggestionSchema.parse(rawParsed);
          // Sanitize suggestions
          parsedContent = {
            suggestions: validated.suggestions.map(s => ({
              ...s,
              title: sanitizeText(s.title),
              description: sanitizeText(s.description),
            })),
          };
          console.log('Suggestions validated and sanitized successfully');
        }
      } catch (e) {
        if (e instanceof z.ZodError) {
          console.error("AI output validation failed:", e.errors);
          return new Response(
            JSON.stringify({ error: "AI generated an invalid recipe format. Please try again." }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        console.error("Failed to parse JSON:", e);
        parsedContent = { raw: sanitizeText(content) };
      }
    } else {
      // For chat responses, sanitize the text
      parsedContent = sanitizeText(content);
    }

    return new Response(JSON.stringify({ result: parsedContent }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in generate-recipe function:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
