import { GoogleGenerativeAI } from "npm:@google/generative-ai";

const FEEDBACK_SYSTEM_PROMPT = `Du er en empatisk, skarp og praksisnær pædagogisk vejleder, der giver skriftlig feedback til en kollega på deres undervisningsdesign.

STRIKSE REGLER FOR DIT SPROG:

Du må ALDRIG bruge ordene kvadrant, koordinat, beregnet, epistemologisk, tyngdepunkt, eller friktion.

Sproget skal være nede på jorden, anerkendende og direkte.

Ingen sludrende AI-indledninger. Start direkte med overskriften.

STRUKTUR FOR DIT SVAR (Brug disse 3 overskrifter i fed):

**Dit didaktiske fokus:**
Oversæt den underliggende kategori til praksis i klasserummet. Flet 2-3 af lærerens valgte kort ind. Påpeg spændende udfordringer, hvis de har valgt meget forskellige kort.

**Teknologien i praksis:**
Hvordan spiller deres valgte teknologi sammen med deres didaktiske mål? Skriv om elevernes faktiske brug af teknologien.

**Spørgsmål til refleksion:**
Afslut med præcis 2 skarpe, praksisnære spørgsmål som bullet points.`;

export default async (req, context) => {
    if (req.method !== "POST") {
        return new Response("Method Not Allowed", { status: 405 });
    }

    try {
        const apiKey = Netlify.env.get("GEMINI_API_KEY");
        
        if (!apiKey || apiKey === 'indsæt_din_nøgle_her') {
            return new Response(JSON.stringify({ error: "Gemini API nøgle mangler i miljøvariabler (Netlify)" }), {
                status: 500,
                headers: { "Content-Type": "application/json" }
            });
        }

        const body = await req.json();
        const { cards, quadrant, techRole } = body;
        
        if (!cards || !quadrant || !techRole) {
            return new Response(JSON.stringify({ error: "Manglende data til feedback-generering." }), {
                status: 400,
                headers: { "Content-Type": "application/json" }
            });
        }

        const userPrompt = `
Lærerens valg af Teknologirolle: ${techRole}
Beregnet Epistemologisk Kvadrant: ${quadrant}
Udvalgte didaktiske handlingskort i forløbet:
${cards.map(c => "- " + c).join('\n')}

Generer din feedback baseret på ovenstående data i Markdown-format.`;

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({
            model: "gemini-2.5-flash",
            systemInstruction: FEEDBACK_SYSTEM_PROMPT
        });

        const result = await model.generateContent(userPrompt);
        const markdownFeedback = result.response.text();

        return new Response(JSON.stringify({ feedback: markdownFeedback }), {
            status: 200,
            headers: { "Content-Type": "application/json" }
        });
    } catch (error) {
        console.error("Fejl ved generering af feedback (Edge):", error);
        return new Response(JSON.stringify({ error: "Kunne ikke generere feedback. Prøv igen." }), {
            status: 500,
            headers: { "Content-Type": "application/json" }
        });
    }
};

export const config = {
    path: "/api/generate-feedback"
};
