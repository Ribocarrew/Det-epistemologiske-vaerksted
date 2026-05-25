const express = require('express');
const dotenv = require('dotenv');
const { GoogleGenerativeAI, SchemaType } = require('@google/generative-ai');
const path = require('path');

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

const app = express();
const port = 8080;

app.use(express.json());
// Serve the HTML/CSS/JS files from this directory
app.use(express.static(__dirname));

// Initialize Gemini
const apiKey = process.env.GEMINI_API_KEY;
let genAI = null;
if (apiKey && apiKey !== 'indsæt_din_nøgle_her') {
    genAI = new GoogleGenerativeAI(apiKey);
}

const SYSTEM_PROMPT = `Du er en didaktisk analytiker. Analyser en didaktisk handling ud fra to akser. AKSE X (Epistemologi): -10=Øjets. +10=Håndens. AKSE Y (Friktion): -10=Glat. +10=Friktion. Returner KUN JSON i dette format: {"x":[int],"y":[int],"begrundelse":"[én sætning]"}`;

app.post('/api/analyze', async (req, res) => {
    try {
        if (!genAI) {
            return res.status(500).json({ error: "Gemini API nøgle mangler i .env.local" });
        }

        const { text } = req.body;
        if (!text) {
            return res.status(400).json({ error: "Manglende tekst-input." });
        }

        const model = genAI.getGenerativeModel({
            model: "gemini-2.5-flash",
            systemInstruction: SYSTEM_PROMPT,
            generationConfig: {
                responseMimeType: "application/json",
            }
        });

        const result = await model.generateContent(text);
        const responseText = result.response.text();
        
        // Parse JSON safely
        const parsedData = JSON.parse(responseText);
        
        // Ensure format
        if (typeof parsedData.x !== 'number' || typeof parsedData.y !== 'number' || !parsedData.begrundelse) {
            throw new Error("Invalid format fra Gemini");
        }

        res.json(parsedData);
    } catch (error) {
        console.error("Fejl ved Gemini kald:", error);
        res.status(500).json({ error: "Kunne ikke analysere kortet. Prøv igen." });
    }
});

const FEEDBACK_SYSTEM_PROMPT = `Du er en empatisk, skarp og praksisnær pædagogisk vejleder, der giver skriftlig feedback til en kollega på deres undervisningsdesign.

STRIKSE REGLER FOR DIT SPROG:

Du må ALDRIG bruge ordene kvadrant, koordinat, beregnet, epistemologisk, tyngdepunkt, eller friktion.

Sproget skal være nede på jorden, anerkendende og direkte. Brug et tilgængeligt, støttende hverdagssprog, som alle lærere og lærerstuderende kan forstå. Undgå tunge akademiske begreber.

Ingen sludrende AI-indledninger. Start direkte med overskriften.

STRUKTUR FOR DIT SVAR (Brug disse 3 overskrifter i fed):

**Indbyg Metakognition (Tænkning om læring):**
Du skal altid stille læreren et nysgerrigt spørgsmål om elevernes tænkning. Spørg f.eks. i et let sprog: Hvordan kan du hjælpe eleverne med ikke bare at løse opgaven, men også blive bevidste om, hvordan og hvorfor de lærer det? Inddrag lærerens valgte kort i refleksionen.

**Foreslå Mikro-friktion (Et lille didaktisk benspænd):**
Du må ikke foreslå, at hele forløbet laves om. Foreslå i stedet én overkommelig og lille forstyrrelse – f.eks. et åbent spørgsmål eller et lille benspænd – læreren nemt kan lægge ind i lektionen for at bryde rutinen i 10 minutter.

**Tag snakken med dit team**
Afslut altid din feedback med overskriften "**Tag snakken med dit team**". Her skal du formulere 1-2 helt praksisnære spørgsmål, som læreren kan tage med til sit næste teammøde eller til sin pædagogiske vejleder. F.eks.: Hvordan kan vi i fællesskab finde tid til små forstyrrelser i undervisningen, uden at vi stresser over pensum?

VIGTIGT: Du MÅ KUN returnere dit svar som et gyldigt JSON-objekt. Ingen markdown, ingen code blocks (som f.eks. \`\`\`json). Svaret må kun indeholde en JSON med én key "feedback".
Format:
{ "feedback": "Din fulde feedback tekst her med evt. markdown styling (fed/kursiv) inkluderet i selve strengen" }\`;

app.post('/api/generate-feedback', async (req, res) => {
    try {
        if (!genAI) {
            return res.status(500).json({ error: "Gemini API nøgle mangler i .env.local" });
        }

        const { cards, quadrant, techRole, title, intention } = req.body;
        
        if (!cards || !quadrant || !techRole) {
            return res.status(400).json({ error: "Manglende data til feedback-generering." });
        }

        const userPrompt = \`
Lærerens Forløbsnavn: \${title || 'Ikke angivet'}
Lærerens pædagogiske intention med forløbet: "\${intention || 'Ikke angivet'}"

Lærerens valg af Teknologirolle: \${techRole}
Beregnet Epistemologisk Kvadrant: \${quadrant}
Udvalgte didaktiske handlingskort i forløbet:
\${cards.map(c => "- " + c).join('\\n')}

Generer din feedback baseret på ovenstående data i Markdown-format. Vurder særligt om de valgte kort og teknologirollen rent faktisk understøtter den angivne pædagogiske intention, eller om der er en diskrepans.\`;

        const model = genAI.getGenerativeModel({
            model: "gemini-2.5-flash",
            systemInstruction: FEEDBACK_SYSTEM_PROMPT,
            generationConfig: {
                responseMimeType: "application/json",
            }
        });

        const result = await model.generateContent(userPrompt);
        let rawText = result.response.text();
        
        // Rens eventuel markdown væk
        rawText = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
        
        let feedbackContent = "";
        try {
            const data = JSON.parse(rawText);
            feedbackContent = data.feedback || rawText; // Brug JSON, eller fallback til raw hvis 'feedback' mangler
        } catch (error) {
            console.warn("JSON Parse fejlede. Bruger rå tekst som fallback.");
            feedbackContent = rawText; // Fallback: Send bare teksten direkte
        }
        
        res.json({ feedback: feedbackContent });
    } catch (error) {
        console.error("Fejl ved generering af feedback:", error);
        res.status(500).json({ error: "Kunne ikke generere feedback. Prøv igen." });
    }
});

app.listen(port, () => {
    console.log(`🚀 Epistemologisk Værksted server kører på http://localhost:${port}`);
});
