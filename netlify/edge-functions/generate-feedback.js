import { GoogleGenerativeAI } from "https://esm.sh/@google/generative-ai";

const FEEDBACK_SYSTEM_PROMPT = `Du er en empatisk, skarp og praksisnær pædagogisk vejleder, der giver skriftlig feedback til en kollega på deres undervisningsdesign.

STRIKSE REGLER FOR DIT SPROG:

Du må ALDRIG bruge ordene kvadrant, koordinat, beregnet, epistemologisk, tyngdepunkt, eller friktion.

Sproget skal være nede på jorden, anerkendende og direkte. Brug et tilgængeligt, støttende hverdagssprog, som alle lærere og lærerstuderende kan forstå. Undgå tunge akademiske begreber.

Ingen sludrende AI-indledninger. Start direkte med overskriften.

STRUKTUR FOR DIT SVAR (Brug disse 3 overskrifter i fed):

VIGTIG ANALYTISK REGEL (Den neutrale midtzone): Forskning viser, at mange lærere fravælger den styrede/reproduktive undervisning, men i stedet for at designe reel undersøgende modstand, lander de i et neutralt midterfelt (f.eks. ved at vælge neutrale kort som gruppearbejde eller informationssøgning). Hvis brugeren har valgt flere grå/neutrale kort, skal du venligt påpege dette fænomen i din feedback. Spørg f.eks.: "Jeg kan se, at du har valgt flere af de neutrale praksisser. Disse åbner rummet, men de skaber ikke nødvendigvis dyb faglig modstand. Hvordan kan du sikre, at forløbet ikke bare bliver en blød mellemvej, men faktisk skaber en ægte faglig modstand for eleverne?"

**Indbyg Metakognition (Tænkning om læring):**
Du skal altid stille læreren et nysgerrigt spørgsmål om elevernes tænkning. Spørg f.eks. i et let sprog: Hvordan kan du hjælpe eleverne med ikke bare at løse opgaven, men også blive bevidste om, hvordan og hvorfor de lærer det? Inddrag lærerens valgte kort i refleksionen.

**Foreslå Mikro-friktion (Et lille didaktisk benspænd):**
Du må ikke foreslå, at hele forløbet laves om. Foreslå i stedet én overkommelig og lille forstyrrelse – f.eks. et åbent spørgsmål eller et lille benspænd – læreren nemt kan lægge ind i lektionen for at bryde rutinen i 10 minutter.

**Tag snakken med dit team**
Afslut altid din feedback med overskriften "**Tag snakken med dit team**". Her skal du formulere 1-2 helt praksisnære spørgsmål, som læreren kan tage med til sit næste teammøde eller til sin pædagogiske vejleder. F.eks.: Hvordan kan vi i fællesskab finde tid til små forstyrrelser i undervisningen, uden at vi stresser over pensum?

VIGTIGT: Du MÅ KUN returnere dit svar som et gyldigt JSON-objekt. Ingen markdown, ingen code blocks (som f.eks. \`\`\`json). Svaret må kun indeholde en JSON med én key "feedback".
Format:
{ "feedback": "Din fulde feedback tekst her med evt. markdown styling (fed/kursiv) inkluderet i selve strengen" }`;

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
        const { cards, quadrant, techRole, title, intention } = body;
        
        if (!cards || !quadrant || !techRole) {
            return new Response(JSON.stringify({ error: "Manglende data til feedback-generering." }), {
                status: 400,
                headers: { "Content-Type": "application/json" }
            });
        }

        const userPrompt = `
Lærerens Forløbsnavn: ${title || 'Ikke angivet'}
Lærerens pædagogiske intention med forløbet: "${intention || 'Ikke angivet'}"

Lærerens valg af Teknologirolle: ${techRole}
Beregnet Epistemologisk Kvadrant: ${quadrant}
Udvalgte didaktiske handlingskort i forløbet:
${cards.map(c => "- " + c).join('\n')}

Generer din feedback baseret på ovenstående data. Vurder særligt om de valgte kort og teknologirollen rent faktisk understøtter den angivne pædagogiske intention, eller om der er en diskrepans.`;

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({
            model: "gemini-2.5-flash",
            systemInstruction: FEEDBACK_SYSTEM_PROMPT,
            generationConfig: {
                responseMimeType: "application/json",
            }
        });

        console.log("Starter Gemini API kald for feedback...");
        const result = await model.generateContent(userPrompt);
        console.log("Gemini API kald fuldført! Parser svar...");
        
        let rawText = result.response.text();
        
        // Rens eventuel markdown væk
        rawText = rawText.replace(/\`\`\`json/g, '').replace(/\`\`\`/g, '').trim();
        
        let feedbackContent = "";
        try {
            const data = JSON.parse(rawText);
            feedbackContent = data.feedback || rawText; // Brug JSON, eller fallback til raw hvis 'feedback' mangler
        } catch (error) {
            console.warn("JSON Parse fejlede. Bruger rå tekst som fallback.");
            feedbackContent = rawText; // Fallback: Send bare teksten direkte
        }

        return new Response(JSON.stringify({ feedback: feedbackContent }), {
            status: 200,
            headers: { "Content-Type": "application/json" }
        });
    } catch (error) {
        console.error("Fatal backend error:", error);
        return new Response(JSON.stringify({ 
            feedback: "Der opstod en fejl hos AI'en: " + (error.message || error.toString()) + ". Prøv venligst at trykke på knappen igen." 
        }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }
};

export const config = {
    path: "/api/generate-feedback"
};
