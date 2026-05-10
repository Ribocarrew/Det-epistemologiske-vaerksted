import { GoogleGenerativeAI } from "npm:@google/generative-ai";

const SYSTEM_PROMPT = `Du er en didaktisk analytiker. Analyser en didaktisk handling ud fra to akser. AKSE X (Epistemologi): -10=Øjets. +10=Håndens. AKSE Y (Friktion): -10=Glat. +10=Friktion. Returner KUN JSON i dette format: {"x":[int],"y":[int],"begrundelse":"[én sætning]"}`;

export default async (req, context) => {
    if (req.method !== "POST") {
        return new Response("Method Not Allowed", { status: 405 });
    }

    try {
        // Hent miljøvariabel (Netlify Edge syntax)
        const apiKey = Netlify.env.get("GEMINI_API_KEY");
        
        if (!apiKey || apiKey === 'indsæt_din_nøgle_her') {
            return new Response(JSON.stringify({ error: "Gemini API nøgle mangler i miljøvariabler (Netlify)" }), {
                status: 500,
                headers: { "Content-Type": "application/json" }
            });
        }

        const body = await req.json();
        const { text } = body;
        
        if (!text) {
            return new Response(JSON.stringify({ error: "Manglende tekst-input." }), {
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

        const result = await model.generateContent(text);
        const responseText = result.response.text();
        
        const parsedData = JSON.parse(responseText);
        
        if (typeof parsedData.x !== 'number' || typeof parsedData.y !== 'number' || !parsedData.begrundelse) {
            throw new Error("Invalid format fra Gemini");
        }

        return new Response(JSON.stringify(parsedData), {
            status: 200,
            headers: { "Content-Type": "application/json" }
        });
    } catch (error) {
        console.error("Fejl ved Gemini kald (Edge):", error);
        return new Response(JSON.stringify({ error: "Kunne ikke analysere kortet. Prøv igen." }), {
            status: 500,
            headers: { "Content-Type": "application/json" }
        });
    }
};

export const config = {
    path: "/api/analyze"
};
