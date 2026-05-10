export interface Card {
    id: number;
    text: string;
    description: string;
    quadrant: 'IR' | 'AT' | 'SA' | 'TB';
    x: number;
    y: number;
}

export const cards: Card[] = [
    {
        id: 1,
        text: "Viden præsenteres som færdige, korrekte svar der skal huskes og genkendes",
        description: "Kernebeskrivelsen af øjets epistemologi (Brinkmann & Tanggaard, 2013): viden er korrekt repræsentation der identificeres, ikke skabes. Teknologi- og fagneutral.",
        quadrant: "IR",
        x: -8,
        y: -8
    },
    {
        id: 2,
        text: "Eleven er primært tilskuer eller lytter — læreren bærer den aktive rolle",
        description: "Lorties (1975) apprenticeship of observation: den asymmetriske rollefordeling internaliseres som normalform. 'Primært' signalerer analytisk nuance frem for absolut beskrivelse.",
        quadrant: "IR",
        x: -7,
        y: -7
    },
    {
        id: 3,
        text: "Opgaven har ét rigtigt svar, og metoden til at nå det er fastlagt på forhånd",
        description: "Operationaliserer Deweys (1938b) afklarede situation. Dobbeltbestemmelsen — lukket svar OG fastlagt metode — er analytisk afgørende.",
        quadrant: "IR",
        x: -6,
        y: -8
    },
    {
        id: 4,
        text: "Teknologien bruges til at vise, afspille eller distribuere fagligt indhold",
        description: "Fawns (2022): teknologiens epistemologiske rolle afhænger af konteksten. Bijker (1995): LMS og whiteboard er stabiliserede teknologier med denne fortolkning som dominerende.",
        quadrant: "IR",
        x: -8,
        y: -6
    },
    {
        id: 5,
        text: "Eleven bekræfter eller gengiver det, der allerede er præsenteret",
        description: "Sfards (1998) tilegnelsesmetafor i sin reneste form: erkendelsesretningen er reproduktiv. Dækker bredt fra multiple choice til skriftlig opsummering.",
        quadrant: "IR",
        x: -7,
        y: -6
    },
    {
        id: 6,
        text: "Vurderingen handler om, om svaret er korrekt — ikke om processen bag",
        description: "Deweys kritik af tilskuerteorien manifesteret i vurderingspraksis. Biesta (2011): kvalifikationsparadigmets dominans.",
        quadrant: "IR",
        x: -6,
        y: -7
    },
    {
        id: 7,
        text: "Læreren definerer på forhånd, hvilken viden der er relevant at tilegne sig",
        description: "Vidensselektion som magthandling (Biesta, 2011). Winner (1980): institutionaliserede teknologier forstærker denne selektion tavst.",
        quadrant: "IR",
        x: -8,
        y: -5
    },
    {
        id: 8,
        text: "Forløbet bevæger sig mod en bestemt, foruddefineret faglig konklusion",
        description: "Modsætningen til Deweys inquiry (1938b): en undersøgelse der kender sin konklusion er ikke undersøgelse — det er demonstration.",
        quadrant: "IR",
        x: -5,
        y: -8
    },
    {
        id: 9,
        text: "Læring forstås implicit som ophobning — jo mere eleven ved, des bedre",
        description: "Sfards (1998) tilegnelsesmetafor som designlogik, ikke eksplicit instruktion. 'Implicit' er afgørende — det handler om hvad designet kommunikerer.",
        quadrant: "IR",
        x: -7,
        y: -5
    },
    {
        id: 10,
        text: "Eleven analyserer og vurderer information fra to eller flere modstridende kilder",
        description: "Kildeanalyse som klassisk AT-aktivitet: analytisk aktiv elev, receptivt videnssyn. 'Modstridende' sikrer ægte analytisk friktion.",
        quadrant: "AT",
        x: -6,
        y: 7
    },
    {
        id: 11,
        text: "Eleven argumenterer for et standpunkt og udfordres aktivt i sin begrundelse",
        description: "AT's kerneform. 'Udfordres aktivt' er afgørende — uden modstand er argumentation blot reproduktion i ny form.",
        quadrant: "AT",
        x: -5,
        y: 7
    },
    {
        id: 12,
        text: "Eleven stiller spørgsmål til præsenteret viden og leder selvstændigt efter svar",
        description: "Overgangen fra IR til AT. 'Selvstændigt' signalerer AT, 'præsenteret viden' holder videnssynet receptivt.",
        quadrant: "AT",
        x: -6,
        y: 6
    },
    {
        id: 13,
        text: "Eleven afkoder bias, perspektiv eller skjulte antagelser i et materiale",
        description: "Mediepædagogikkens kernekompetence operationaliseret epistemologisk. Lund (2020): den type refleksivitet der kendetegner professionel lærertænkning.",
        quadrant: "AT",
        x: -7,
        y: 7
    },
    {
        id: 14,
        text: "Eleven sammenligner og rangordner løsninger ud fra kriterier hun selv formulerer",
        description: "Epistemisk autonomi i vurderingshandlingen. Stadig AT fordi vurderingen sker i forhold til eksisterende løsninger.",
        quadrant: "AT",
        x: -5,
        y: 6
    },
    {
        id: 15,
        text: "Eleven formulerer selvstændigt undersøgelsesspørgsmål til et emne der er præsenteret",
        description: "Spørgsmålsformulering som epistemisk handling — central i Deweys inquiry (1938b). AT fordi emnet er givet udefra.",
        quadrant: "AT",
        x: -4,
        y: 6
    },
    {
        id: 16,
        text: "Eleven diskuterer og udfordrer medstuderendes fortolkninger af et fagligt indhold",
        description: "Wengers (1998) forhandling af mening. AT: det faglige indhold er givet. 'Udfordrer' kræver ægte epistemisk friktion.",
        quadrant: "AT",
        x: -6,
        y: 8
    },
    {
        id: 17,
        text: "Eleven vurderer kilders troværdighed og metode — ikke blot deres indhold",
        description: "Metakritik: at vurdere hvordan en kilde producerer viden. Højere orden AT der nærmer sig epistemologisk refleksivitet.",
        quadrant: "AT",
        x: -7,
        y: 8
    },
    {
        id: 18,
        text: "Eleven forbinder faglig viden med egne erfaringer og stiller kritiske spørgsmål til sammenhængen",
        description: "Deweys pragmatiske erfaringsbegreb (1938a): erkendelse i transaktionen. AT fordi fagviden er givet — men eleven kobler kritisk og udfordrer koblingen.",
        quadrant: "AT",
        x: -5,
        y: 5
    },
    {
        id: 19,
        text: "Eleven producerer et produkt, men fremgangsmåden er fastsat trin for trin",
        description: "SA's ikoniske mønster. Fraværet af friktion skyldes at vejen er kortlagt. Bijker: produktionsteknologier er designet ind i denne logik.",
        quadrant: "SA",
        x: 6,
        y: -7
    },
    {
        id: 20,
        text: "Teknologien bruges som produktionsværktøj, men problemet er allerede løst",
        description: "Fawns (2022) + MacKenzie (1999): teknologien leverer produktionskapacitet, men den epistemologiske struktur er IR-agtig.",
        quadrant: "SA",
        x: 7,
        y: -6
    },
    {
        id: 21,
        text: "Aktiviteten er kreativ, men der er ingen reel faglig modstand eller åbenhed",
        description: "Det farligste SA-mønster. Dalsgaard (2025): kreativitet uden friktion er underholdning, ikke erkendelse.",
        quadrant: "SA",
        x: 7,
        y: -5
    },
    {
        id: 22,
        text: "Eleven udfolder en given løsning frem for at finde sin egen",
        description: "Brinkmann & Tanggaard (2013): udfoldelse er produktivt arbejde inden for en given ramme. 'Frem for at finde sin egen' peger på det fraværende.",
        quadrant: "SA",
        x: 6,
        y: -6
    },
    {
        id: 23,
        text: "Eleven samarbejder om opgaven, men roller og arbejdsdeling er fastsat af læreren",
        description: "Wenger (1998): koordination snarere end forhandling af mening. Gruppen arbejder, men den epistemiske struktur er fastsat udefra.",
        quadrant: "SA",
        x: 5,
        y: -5
    },
    {
        id: 24,
        text: "Eleven dokumenterer et forløb eller produkt frem for at undersøge et problem",
        description: "Dokumentationsopgaver er SA-gennemgående i digitaliseret undervisning. Dewey (1938b): at beskrive hvad man ser er ikke inquiry.",
        quadrant: "SA",
        x: 6,
        y: -4
    },
    {
        id: 25,
        text: "Eleven vælger mellem foruddefinerede muligheder — selvstændigheden er tilsyneladende, ikke reel",
        description: "Falsk autonomi. Polanyi (1966): eleven bekræfter hvad læreren har defineret. Winner (1980): teknologier kan iscenesætte valg der ikke reelt er valg.",
        quadrant: "SA",
        x: 5,
        y: -6
    },
    {
        id: 26,
        text: "Forløbet prioriterer et gennemarbejdet slutprodukt over den faglige tænkning undervejs",
        description: "Biesta (2011): kvalifikationsparadigmets dominans. 'Prioriterer' peger på designlogik, ikke eksplicit instruktion.",
        quadrant: "SA",
        x: 7,
        y: -4
    },
    {
        id: 27,
        text: "Teknologien bruges til at præsentere en konklusion, der er formuleret på forhånd",
        description: "Fawns (2022): teknologien er entangled med overleveringslogikken. Bijker: præsentationsteknologier bærer denne fortolkning som stabiliseret norm.",
        quadrant: "SA",
        x: 6,
        y: -5
    },
    {
        id: 28,
        text: "Eleven møder et problem, hvor hverken svar eller metode er givet på forhånd",
        description: "TB's definitionskort. Deweys ubestemte situation (1938b). Dobbeltbestemmelsen adskiller fra AT og SA. Betingelsen for ægte inquiry.",
        quadrant: "TB",
        x: 7,
        y: 8
    },
    {
        id: 29,
        text: "Eleven producerer ny viden, der ikke eksisterede i det materiale hun modtog",
        description: "Brinkmann & Tanggaard (2013): håndens epistemologi producerer viden som temporal aktivitet. 'Ikke eksisterede i det materiale' kræver det genuint generative.",
        quadrant: "TB",
        x: 8,
        y: 8
    },
    {
        id: 30,
        text: "Processen er iterativ — eleven reviderer, fejler og prøver igen",
        description: "Schön (1983): i mødet med det uventede opstår erkendelse. Fejl er planlagt læringsstruktur, ikke undladelse.",
        quadrant: "TB",
        x: 7,
        y: 7
    },
    {
        id: 31,
        text: "Produktet eksisterer for et virkeligt publikum — ikke kun for læreren",
        description: "Autenticitet som epistemologisk princip. Biesta (2011): subjektifikation kræver tilstedeværelse i verden. 'Ikke kun for læreren' er kortets analytiske kerne.",
        quadrant: "TB",
        x: 8,
        y: 7
    },
    {
        id: 32,
        text: "Eleven træffer reelle faglige valg, der ændrer udfaldet af forløbet",
        description: "Epistemisk aktørskab. 'Reelle valg' adskiller fra SA's tilsyneladende autonomi (kort 25): konsekvenserne er ægte. Dewey (1938a): erkendelse i transaktionen.",
        quadrant: "TB",
        x: 7,
        y: 9
    },
    {
        id: 33,
        text: "Teknologien bruges som formbart materiale — eleven undersøger, hvad det kan",
        description: "Fawns (2022) + Brinkmann & Tanggaard (2013): teknologien som epistemologisk medium. 'Formbart materiale' er en håndværksmetafor der knytter an til laugenes epistemologi.",
        quadrant: "TB",
        x: 8,
        y: 6
    },
    {
        id: 34,
        text: "Eleven tager selvstændig stilling til, hvilken retning undersøgelsen skal gå",
        description: "Epistemisk autonomi på metaniveauet. Dewey (1938b): at identificere og formulere problemet er selv en erkendelseshandling. Løbende, procesuel autonomi.",
        quadrant: "TB",
        x: 6,
        y: 8
    },
    {
        id: 35,
        text: "Forløbet er designet til at producere overraskelse — eleven møder det uventede",
        description: "Dalsgaard (2025): reflective friction. At møde det modsigende er betingelsen for genuine indsigt. 'Designet til' markerer intentionaliteten: det er et bevidst pædagogisk valg.",
        quadrant: "TB",
        x: 7,
        y: 8
    },
    {
        id: 36,
        text: "Eleven tager medansvar for at definere, hvad der tæller som et godt svar i dette forløb",
        description: "Biesta (2011) om subjektifikation: at deltage i at definere vurderingsstandarden er en epistemisk handling. Det mest radikale kort i biblioteket.",
        quadrant: "TB",
        x: 9,
        y: 7
    }
];
