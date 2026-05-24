import { GoogleGenerativeAI } from "https://esm.sh/@google/generative-ai";

const SYSTEM_PROMPT = `Du er en didaktisk analytiker. Generer 2-3 pædagogiske didaktiske handlingskort baseret på lærerens intention for et forløb.
Hvert kort skal foreslå en specifik pædagogisk/didaktisk handling eller et design-valg, der matcher intentionen (f.eks. "Eleverne filmer hinanden", "Læreren gennemgår begreber på tavlen", "Eleverne undersøger lokale vandprøver").
Hvert kort skal have en kort 'text' (overskrift/kort handling) og en uddybende 'description' (beskrivelse af handlingen).
Placer hvert kort i det didaktiske felt ved hjælp af to akser.
AKSE X (Epistemologi): -10=Øjets (observation, modtagelse, analyse). +10=Håndens (skabelse, produktion, intervention).
AKSE Y (Friktion): -10=Glat (stramt styret, reproduktion, hurtige svar). +10=Friktion (udforskende, kognitiv modstand, fejl-tilladende).

Returner KUN et JSON objekt med et 'cards' array indeholdende kortene. Hvert kort skal have præcis dette format:
{"text": "[Kort overskrift]", "description": "[Uddybende beskrivelse af handlingen]", "x": [int mellem -10 og 10], "y": [int mellem -10 og 10], "begrundelse": "[Kort begrundelse for placeringen på akserne]"}

VIGTIGT: Du må KUN returnere et gyldigt JSON-objekt. Ingen markdown, ingen kodeblokke (\`\`\`json), ingen samtaletale. Kun ren JSON:
{ "cards": [ { "text": "Kort titel", "description": "Kort beskrivelse", "x": 0, "y": 0, "begrundelse": "Begrundelse" } ] }`;

export default async (req, context) => {
    if (!Netlify.env.get("GEMINI_API_KEY")) {
        return new Response(JSON.stringify({ error: "API-nøgle mangler i Edge miljøet!" }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }

    if (req.method !== "POST") {
        return new Response("Method Not Allowed", { status: 405 });
    }

    try {
        const apiKey = Netlify.env.get("GEMINI_API_KEY");
        
        if (apiKey === 'indsæt_din_nøgle_her') {
            return new Response(JSON.stringify({ error: "Gemini API nøgle mangler i miljøvariabler (Netlify)" }), {
                status: 500,
                headers: { "Content-Type": "application/json" }
            });
        }

        const body = await req.json();
        const { intention } = body;
        
        if (!intention) {
            return new Response(JSON.stringify({ error: "Manglende intention." }), {
                status: 400,
                headers: { "Content-Type": "application/json" }
            });
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({
            model: "gemini-2.5-flash",
            systemInstruction: SYSTEM_PROMPT,
            generationConfig: {
                responseMimeType: "application/json",
            }
        });

        const userPrompt = `Lærerens pædagogiske intention med forløbet er:
"${intention}"

Generer 2-3 skarpe, relevante handlingskort baseret på denne intention.`;

        const result = await model.generateContent(userPrompt);
        let rawText = result.response.text();
        
        // Fjern markdown code blocks, hvis Gemini alligevel har indsat dem
        rawText = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
        
        let parsedData;
        try {
            parsedData = JSON.parse(rawText);
        } catch (error) {
            console.error("JSON Parse Error:", error, "Raw text was:", rawText);
            throw new Error("Invalid format fra Gemini. Kunne ikke parse JSON.");
        }
        
        if (!parsedData.cards || !Array.isArray(parsedData.cards)) {
            throw new Error("Invalid format fra Gemini. Forventede et 'cards' array.");
        }

        return new Response(JSON.stringify(parsedData), {
            status: 200,
            headers: { "Content-Type": "application/json" }
        });
    } catch (error) {
        console.error("API Error:", error);
        return new Response(JSON.stringify({ error: error.message || "Ukendt serverfejl" }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
};

export const config = {
    path: "/api/generate-cards"
};
