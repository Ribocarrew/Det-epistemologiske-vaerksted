import { cards } from './cards.js';

// DOM Elements
const svg = document.getElementById('matrix-svg');
const resultQuadrant = document.getElementById('result-quadrant');
const resultTech = document.getElementById('result-tech');
const feedbackMessage = document.getElementById('feedback-message');
const resetBtn = document.getElementById('resetBtn');
const exportPdfBtn = document.getElementById('exportPdfBtn');

// Load State
const mirrorStateRaw = localStorage.getItem('epistemologisk_mirror_state');
const techRole = localStorage.getItem('epistemologisk_tech_role');
const courseTitle = localStorage.getItem('epistemologisk_course_title');
const courseIntention = localStorage.getItem('epistemologisk_course_intention');

if (!mirrorStateRaw || !techRole) {
    // State missing, redirect to start
    window.location.href = 'index.html';
}

const mirrorState = JSON.parse(mirrorStateRaw);

// Load custom cards
const savedCustom = localStorage.getItem('epistemologisk_custom_cards');
if (savedCustom) {
    try {
        const customCards = JSON.parse(savedCustom);
        cards.push(...customCards);
    } catch(e) {}
}

function init() {
    if (courseTitle) {
        const headerTitle = document.getElementById('header-title');
        const pdfHeaderTitle = document.getElementById('pdf-header-title');
        if (headerTitle) headerTitle.textContent = courseTitle;
        if (pdfHeaderTitle) pdfHeaderTitle.textContent = courseTitle;
    }

    try {
        calculateAndPlot();
    } catch (e) {
        document.getElementById('feedback-message').textContent = 'Fejl i beregning: ' + e.message;
        console.error(e);
    }
    
    resetBtn.addEventListener('click', (e) => {
        e.preventDefault();
        console.log("Nulstiller alt data...");
        try {
            localStorage.clear();
        } catch(err) {
            console.error("Kunne ikke rydde localStorage:", err);
        }
        // Brug replace så man ikke kan trykke 'Tilbage' og se gamle data
        window.location.replace('index.html');
    });

    exportPdfBtn.addEventListener('click', generatePDF);
}

async function calculateAndPlot() {
    let sumX = 0;
    let sumY = 0;
    let sumWeight = 0;

    // Calculate weighted sum
    mirrorState.forEach(slot => {
        sumX += slot.x * slot.weight;
        sumY += slot.y * slot.weight;
        sumWeight += slot.weight;
    });

    // Centroid
    // Avoid division by zero just in case (though weights sum to 12)
    const centroidX = sumWeight > 0 ? sumX / sumWeight : 0;
    const centroidY = sumWeight > 0 ? sumY / sumWeight : 0;

    // Determine Quadrant
    let quadrant = '';
    let quadrantName = '';
    
    if (centroidX < 0 && centroidY < 0) {
        quadrant = 'IR';
        quadrantName = 'Instrumentel Reproduktion';
    } else if (centroidX < 0 && centroidY >= 0) {
        quadrant = 'AT';
        quadrantName = 'Adaptiv Træning';
    } else if (centroidX >= 0 && centroidY < 0) {
        quadrant = 'SA';
        quadrantName = 'Skin-Aktivitet';
    } else {
        quadrant = 'TB';
        quadrantName = 'Det Transformative Brud';
    }

    // Map Technology Role to its full name
    const roleNames = {
        'A': 'Det digitale kopirum',
        'B': 'Det digitale penalhus',
        'C': 'Det digitale værksted',
        'D': 'Det analoge rum'
    };
    
    // Update UI Stats
    resultQuadrant.textContent = quadrantName;
    resultQuadrant.className = `result-badge badge-${quadrant}`;
    resultTech.textContent = roleNames[techRole] || `Rolle ${techRole}`;

    // Get Feedback dynamically via AI
    feedbackMessage.style.opacity = '1';
    feedbackMessage.style.fontFamily = "'Source Serif 4', serif";
    feedbackMessage.style.lineHeight = "1.6";
    feedbackMessage.innerHTML = `
        <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 2rem; text-align: center; animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;">
            <svg class="spinner" xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--color-teal)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="animation: spin 1s linear infinite; margin-bottom: 1rem;"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
            <span style="color: var(--color-teal); font-weight: bold; font-family: var(--font-body);">Analyserer dit epistemologiske design og genererer refleksionsspørgsmål...</span>
        </div>
        <style>
            @keyframes pulse {
                0%, 100% { opacity: 1; }
                50% { opacity: .5; }
            }
        </style>
    `;

    try {
        // Find text for selected cards
        const selectedCardsText = mirrorState.map(slot => {
            const cardObj = cards.find(c => c.id === slot.cardId);
            return cardObj ? cardObj.text : `Kort ${slot.cardId}`;
        });

        // 30 seconds timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000);

        const response = await fetch('/api/generate-feedback', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                cards: selectedCardsText,
                quadrant: quadrantName,
                techRole: roleNames[techRole] || `Rolle ${techRole}`,
                title: courseTitle || 'Ikke angivet',
                intention: courseIntention || 'Ikke angivet'
            }),
            signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ error: "Kunne ikke læse fejl-JSON" }));
            throw new Error(errorData.error || `Serverfejl: ${response.status}`);
        }
        
        let data;
        try {
            data = await response.json();
        } catch (e) {
            throw new Error("Serveren returnerede et ugyldigt svar (ikke JSON).");
        }

        feedbackMessage.style.opacity = '0';
        setTimeout(() => {
            if (data.feedback) {
                try {
                    // Try marked.parse first (newer marked versions), fallback to marked() (older), then plain text
                    if (typeof marked !== 'undefined') {
                        feedbackMessage.innerHTML = marked.parse ? marked.parse(data.feedback) : marked(data.feedback);
                    } else {
                        feedbackMessage.innerText = data.feedback;
                    }
                } catch (err) {
                    console.error("Markdown parse error:", err);
                    feedbackMessage.innerText = data.feedback;
                }
            } else {
                feedbackMessage.innerHTML = `<div class="error-message" style="display: block; margin:0;"><strong>Fejl:</strong> ${data.error || "AI'en returnerede intet svar."}</div>`;
            }
            feedbackMessage.style.transition = 'opacity 0.5s ease';
            feedbackMessage.style.opacity = '1';
        }, 300);

    } catch (error) {
        console.error("Fetch error:", error);
        feedbackMessage.style.opacity = '0';
        setTimeout(() => {
            let msg = "Der opstod en uventet fejl ved kontakt til serveren.";
            if (error.name === 'AbortError') {
                msg = "Anmodningen tog for lang tid (timeout). Gemini API'et kan være overbelastet.";
            } else if (error.message) {
                msg = error.message;
            }
            feedbackMessage.innerHTML = `<div class="error-message" style="display: block; margin:0;"><strong>Systemfejl:</strong> ${msg}</div>`;
            feedbackMessage.style.transition = 'opacity 0.5s ease';
            feedbackMessage.style.opacity = '1';
        }, 300);
    }

    // Plot SVG
    plotDot(centroidX, centroidY);
}

function plotDot(x, y) {
    // Center of SVG / Wrapper (percentage)
    const centerX = 50;
    const centerY = 50;

    // Final Coordinates in percentage
    // Map X [-10, 10] to [0, 100]
    const finalPctX = ((x + 10) / 20) * 100;
    // Map Y [-10, 10] to [0, 100]
    const finalPctY = ((10 - y) / 20) * 100;

    const wrapper = document.querySelector('.matrix-wrapper');
    if (!wrapper) return;
    
    // Ensure wrapper is relative to contain the absolute dot
    wrapper.style.position = 'relative';

    // Create a standard HTML div instead of an SVG circle for better html2canvas rendering
    const dot = document.createElement('div');
    dot.className = 'centroid-dot';
    dot.style.position = 'absolute';
    dot.style.width = '16px';
    dot.style.height = '16px';
    dot.style.backgroundColor = '#F59E0B'; // Amber
    dot.style.borderRadius = '50%';
    dot.style.transform = 'translate(-50%, -50%)'; // Center precisely on the coordinates
    dot.style.zIndex = '10';
    
    // Start position (center)
    dot.style.left = centerX + '%';
    dot.style.top = centerY + '%';
    dot.style.opacity = '0';
    dot.style.transition = 'all 1.5s cubic-bezier(0.25, 1, 0.5, 1)';

    // Append to wrapper, NOT the SVG
    wrapper.appendChild(dot);

    // Trigger animation after a slight delay
    setTimeout(() => {
        dot.style.opacity = '1';
        dot.style.left = finalPctX + '%';
        dot.style.top = finalPctY + '%';
    }, 600); // 600ms delay matches the feedback text fade-in
}

// Run
init();

// Map Technology Role to its full name to be accessible for PDF
const globalRoleNames = {
    'A': 'Det digitale kopirum',
    'B': 'Det digitale penalhus',
    'C': 'Det digitale værksted',
    'D': 'Det analoge rum'
};

function generatePDF() {
    console.log('Genererer PDF...');
    
    // Check if html2pdf is available
    if (typeof window.html2pdf === 'undefined') {
        console.error("html2pdf library is not loaded!");
        alert("Kunne ikke indlæse PDF-motoren. Genindlæs siden og prøv igen.");
        return;
    }

    const element = document.getElementById('pdf-export-template');
    if (!element) {
        console.error("PDF template not found!");
        return;
    }
    
    // 1. Populate Compass Dot
    let sumX = 0;
    let sumY = 0;
    let sumWeight = 0;
    mirrorState.forEach(slot => {
        sumX += slot.x * slot.weight;
        sumY += slot.y * slot.weight;
        sumWeight += slot.weight;
    });
    const cx = sumWeight > 0 ? sumX / sumWeight : 0;
    const cy = sumWeight > 0 ? sumY / sumWeight : 0;
    const finalPctX = ((cx + 10) / 20) * 100;
    const finalPctY = ((10 - cy) / 20) * 100;
    
    const pdfDot = document.getElementById('pdf-dot');
    if (pdfDot) {
        pdfDot.style.left = finalPctX + '%';
        pdfDot.style.top = finalPctY + '%';
    }
    
    // 2. Populate Feedback Profile
    const quadrantElem = document.getElementById('result-quadrant');
    const pdfQuadrant = document.getElementById('pdf-quadrant-badge');
    if (pdfQuadrant && quadrantElem) {
        pdfQuadrant.textContent = quadrantElem.textContent;
        // Keep the base class and add the dynamic badge class
        const badgeClass = Array.from(quadrantElem.classList).find(c => c.startsWith('badge-'));
        if (badgeClass) {
            pdfQuadrant.className = 'result-badge ' + badgeClass;
        }
    }
    
    const pdfTech = document.getElementById('pdf-tech-role');
    const resultTech = document.getElementById('result-tech');
    if (pdfTech && resultTech) {
        pdfTech.textContent = resultTech.textContent;
    }
    
    const pdfFeedback = document.getElementById('pdf-feedback-text');
    const resultFeedback = document.getElementById('feedback-message');
    if (pdfFeedback && resultFeedback) {
        pdfFeedback.innerHTML = resultFeedback.innerHTML;
    }
    
    // 3. Populate Card List
    const pdfCardList = document.getElementById('pdf-card-list');
    if (pdfCardList) {
        pdfCardList.innerHTML = ''; // Clear previous
        
        const weightGroups = {
            3: { label: 'Mest karakteristisk (x3)', cards: [] },
            2: { label: 'Meget karakteristisk (x2)', cards: [] },
            1: { label: 'Karakteristisk (x1)', cards: [] },
            0.5: { label: 'Mindre karakteristisk (x0.5)', cards: [] },
            0: { label: 'Mindst karakteristisk (x0)', cards: [] }
        };
        
        mirrorState.forEach(slot => {
            const cardObj = cards.find(c => c.id === slot.cardId);
            if (cardObj && weightGroups[slot.weight]) {
                weightGroups[slot.weight].cards.push(cardObj.text);
            }
        });
        
        [3, 2, 1, 0.5, 0].forEach(weight => {
            const group = weightGroups[weight];
            if (group.cards.length > 0) {
                const groupDiv = document.createElement('div');
                groupDiv.style.marginBottom = '1.5rem';
                groupDiv.innerHTML = `<h3 style="color: #CA8A04; font-size: 1.2rem; margin-bottom: 0.5rem; margin-top: 0;">${group.label}</h3>`;
                const ul = document.createElement('ul');
                ul.style.listStyleType = 'none';
                ul.style.padding = '0';
                ul.style.margin = '0';
                ul.style.fontFamily = "'Source Serif 4', serif";
                ul.style.color = '#2B2B2B';
                
                group.cards.forEach(text => {
                    const li = document.createElement('li');
                    li.textContent = "• " + text;
                    li.style.marginBottom = '0.5rem';
                    li.style.paddingLeft = '0.5rem';
                    ul.appendChild(li);
                });
                groupDiv.appendChild(ul);
                pdfCardList.appendChild(groupDiv);
            }
        });
    }

    exportPdfBtn.disabled = true;
    exportPdfBtn.textContent = 'Genererer PDF...';
    
    // Options based on user instruction
    const opt = {
        margin:       [10, 10, 10, 10], // Margen i mm for top, højre, bund, venstre
        filename:     'Mit_Epistemologiske_Forloeb.pdf',
        image:        { type: 'jpeg', quality: 1 },
        html2canvas:  { scale: 2, useCORS: true, logging: false },
        jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' },
        pagebreak:    { mode: 'avoid-all' }
    };
    
    // Generate PDF
    window.html2pdf().set(opt).from(element).save().then(() => {
        console.log('PDF genereret succesfuldt!');
        exportPdfBtn.disabled = false;
        exportPdfBtn.textContent = 'Gem som PDF';
    }).catch(err => {
        console.error("PDF generation failed:", err);
        exportPdfBtn.disabled = false;
        exportPdfBtn.textContent = 'Fejl! Prøv igen';
    });
}
