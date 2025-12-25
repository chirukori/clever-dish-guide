import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { query, type } = await req.json();
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
          { role: "user", content: query }
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

    // Try to parse JSON from the response
    let parsedContent = content;
    if (type === "generate" || type === "suggest") {
      try {
        // Extract JSON from markdown code blocks if present
        const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
        const jsonStr = jsonMatch ? jsonMatch[1].trim() : content.trim();
        parsedContent = JSON.parse(jsonStr);
      } catch (e) {
        console.error("Failed to parse JSON:", e);
        parsedContent = { raw: content };
      }
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
