import { GoogleGenerativeAI } from "npm:@google/generative-ai";

const FEEDBACK_SYSTEM_PROMPT = `Du er en empatisk, skarp og praksisnær pædagogisk vejleder, der giver skriftlig feedback til en kollega på deres undervisningsdesign.

STRIKSE REGLER FOR DIT SPROG:

Du må ALDRIG bruge ordene kvadrant, koordinat, beregnet, epistemologisk, tyngdepunkt, eller friktion.

Sproget skal være nede på jorden, anerkendende og direkte. Brug et tilgængeligt, støttende hverdagssprog, som alle lærere og lærerstuderende kan forstå. Undgå tunge akademiske begreber.

Ingen sludrende AI-indledninger. Start direkte med overskriften.

STRUKTUR FOR DIT SVAR (Brug disse 3 overskrifter i fed):

15: **Indbyg Metakognition (Tænkning om læring):**
16: Du skal altid stille læreren et nysgerrigt spørgsmål om elevernes tænkning. Spørg f.eks. i et let sprog: Hvordan kan du hjælpe eleverne med ikke bare at løse opgaven, men også blive bevidste om, hvordan og hvorfor de lærer det? Inddrag lærerens valgte kort i refleksionen.
17: 
18: **Foreslå Mikro-friktion (Et lille didaktisk benspænd):**
19: Du må ikke foreslå, at hele forløbet laves om. Foreslå i stedet én overkommelig og lille forstyrrelse – f.eks. et åbent spørgsmål eller et lille benspænd – læreren nemt kan lægge ind i lektionen for at bryde rutinen i 10 minutter.
20: 
21: **Tag snakken med dit team**
22: Afslut altid din feedback med overskriften "**Tag snakken med dit team**". Her skal du formulere 1-2 helt praksisnære spørgsmål, som læreren kan tage med til sit næste teammøde eller til sin pædagogiske vejleder. F.eks.: Hvordan kan vi i fællesskab finde tid til små forstyrrelser i undervisningen, uden at vi stresser over pensum?
23: 
24: VIGTIGT: Du MÅ KUN returnere dit svar som et gyldigt JSON-objekt. Ingen markdown, ingen code blocks (som f.eks. \`\`\`json). Svaret må kun indeholde en JSON med én key "feedback".
25: Format:
26: { "feedback": "Din fulde feedback tekst her med evt. markdown styling (fed/kursiv) inkluderet i selve strengen" }\`;
27: 
28: export default async (req, context) => {
29:     if (!Netlify.env.get("GEMINI_API_KEY")) {
30:         return new Response(JSON.stringify({ error: "API-nøgle mangler i Edge miljøet!" }), { status: 500, headers: { 'Content-Type': 'application/json' } });
31:     }
32: 
33:     if (req.method !== "POST") {
34:         return new Response("Method Not Allowed", { status: 405 });
35:     }
36: 
37:     try {
38:         const apiKey = Netlify.env.get("GEMINI_API_KEY");
39:         
40:         if (apiKey === 'indsæt_din_nøgle_her') {
41:             return new Response(JSON.stringify({ error: "Gemini API nøgle mangler i miljøvariabler (Netlify)" }), {
42:                 status: 500,
43:                 headers: { "Content-Type": "application/json" }
44:             });
45:         }
46: 
47:         const body = await req.json();
48:         const { cards, quadrant, techRole, title, intention } = body;
49:         
50:         if (!cards || !quadrant || !techRole) {
51:             return new Response(JSON.stringify({ error: "Manglende data til feedback-generering." }), {
52:                 status: 400,
53:                 headers: { "Content-Type": "application/json" }
54:             });
55:         }
56: 
57:         const userPrompt = \`
58: Lærerens Forløbsnavn: \${title || 'Ikke angivet'}
59: Lærerens pædagogiske intention med forløbet: "\${intention || 'Ikke angivet'}"
60: 
61: Lærerens valg af Teknologirolle: \${techRole}
62: Beregnet Epistemologisk Kvadrant: \${quadrant}
63: Udvalgte didaktiske handlingskort i forløbet:
64: \${cards.map(c => "- " + c).join('\\n')}
65: 
66: Generer din feedback baseret på ovenstående data. Vurder særligt om de valgte kort og teknologirollen rent faktisk understøtter den angivne pædagogiske intention, eller om der er en diskrepans.\`;
67: 
68:         const genAI = new GoogleGenerativeAI(apiKey);
69:         const model = genAI.getGenerativeModel({
70:             model: "gemini-2.5-flash",
71:             systemInstruction: FEEDBACK_SYSTEM_PROMPT,
72:             generationConfig: {
73:                 responseMimeType: "application/json",
74:             }
75:         });
76: 
77:         const result = await model.generateContent(userPrompt);
78:         let rawText = result.response.text();
79:         
80:         // Rens eventuel markdown væk
81:         rawText = rawText.replace(/\`\`\`json/g, '').replace(/\`\`\`/g, '').trim();
82:         
83:         let markdownFeedback;
84:         try {
85:             const data = JSON.parse(rawText);
86:             if (!data.feedback) throw new Error("Missing 'feedback' key");
87:             markdownFeedback = data.feedback;
88:         } catch (error) {
89:             console.error("Feedback JSON Parse Error:", error, "Raw text was:", rawText);
90:             throw new Error("Kunne ikke aflæse AI'ens svar. Prøv venligst igen.");
91:         }
92: 
93:         return new Response(JSON.stringify({ feedback: markdownFeedback }), {
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
    path: "/api/generate-feedback"
};
