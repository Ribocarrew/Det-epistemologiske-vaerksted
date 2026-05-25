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
    
    if (courseIntention) {
        const pdfIntentionText = document.getElementById('pdf-intention-text');
        if (pdfIntentionText) pdfIntentionText.textContent = courseIntention;
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
    try {
        if (!mirrorState || !Array.isArray(mirrorState)) {
            throw new Error("Kunne ikke læse dine valgte kort (mirrorState mangler eller er ugyldigt).");
        }

        let sumX = 0;
        let sumY = 0;
        let sumWeight = 0;

        // Calculate weighted sum
        mirrorState.forEach(slot => {
            if (slot && slot.weight !== undefined) {
                sumX += slot.x * slot.weight;
                sumY += slot.y * slot.weight;
                sumWeight += slot.weight;
            }
        });

        // Centroid
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
        
        // Update UI Stats safely
        if (resultQuadrant) {
            resultQuadrant.textContent = quadrantName;
            resultQuadrant.className = \`result-badge badge-\${quadrant}\`;
        }
        if (resultTech) {
            resultTech.textContent = roleNames[techRole] || \`Rolle \${techRole}\`;
        }

        // Plot the dot immediately so the user sees the visual result even while feedback loads
        plotDot(centroidX, centroidY);

        // Get Feedback dynamically via AI
        if (feedbackMessage) {
            feedbackMessage.style.opacity = '1';
            feedbackMessage.style.fontFamily = "'Source Serif 4', serif";
            feedbackMessage.style.lineHeight = "1.6";
            feedbackMessage.innerHTML = \`
                <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 2rem; text-align: center; animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;">
                    <svg class="spinner" xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--color-teal)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="animation: spin 1s linear infinite; margin-bottom: 1rem;"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
                    <span style="color: var(--color-teal); font-weight: bold; font-family: var(--font-body);">Genererer din feedback-profil...</span>
                </div>
                <style>
                    @keyframes pulse {
                        0%, 100% { opacity: 1; }
                        50% { opacity: .5; }
                    }
                </style>
            \`;
        }

        // Find text for selected cards
        const selectedCardsText = mirrorState.map(slot => {
            const cardObj = cards.find(c => c.id === slot.cardId);
            return cardObj ? cardObj.text : \`Kort \${slot.cardId}\`;
        });

        // 30 seconds timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000);

        const response = await fetch('/api/generate-feedback', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                cards: selectedCardsText,
                quadrant: quadrantName,
                techRole: roleNames[techRole] || \`Rolle \${techRole}\`,
                title: courseTitle || 'Ikke angivet',
                intention: courseIntention || 'Ikke angivet'
            }),
            signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
            let errorMsg = \`Netværksfejl fra AI-serveren: \${response.status}\`;
            try {
                const errorData = await response.json();
                if (errorData.feedback) errorMsg = errorData.feedback;
                else if (errorData.error) errorMsg = errorData.error;
            } catch (e) {}
            throw new Error(errorMsg);
        }
        
        const data = await response.json();
        
        if (!data.feedback) {
            throw new Error("AI'en returnerede intet svar.");
        }

        // Render feedback
        if (feedbackMessage) {
            feedbackMessage.style.opacity = '0';
            setTimeout(() => {
                try {
                    if (typeof marked !== 'undefined') {
                        feedbackMessage.innerHTML = marked.parse ? marked.parse(data.feedback) : marked(data.feedback);
                    } else {
                        feedbackMessage.innerText = data.feedback;
                    }
                } catch (err) {
                    console.error("Markdown parse error:", err);
                    feedbackMessage.innerText = data.feedback;
                }
                feedbackMessage.style.transition = 'opacity 0.5s ease';
                feedbackMessage.style.opacity = '1';
            }, 50);
        }

    } catch (error) {
        console.error("Frontend Crash under feedback-generering:", error);
        
        let msg = "Der opstod en lokal fejl i appen.";
        if (error.name === 'AbortError') {
            msg = "Anmodningen tog for lang tid (timeout). Gemini API'et kan være overbelastet.";
        } else if (error.message) {
            msg = error.message;
        }

        if (feedbackMessage) {
            feedbackMessage.style.opacity = '0';
            setTimeout(() => {
                feedbackMessage.innerHTML = \`
                    <div class="error-message" style="display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: 2.5rem; background-color: #FEF2F2; border: 1px solid #FCA5A5; border-radius: 8px;">
                        <strong style="color: #991B1B; margin-bottom: 0.5rem; font-size: 1.1rem;">\${msg}</strong>
                        <button id="retryFeedbackBtn" class="btn" style="background-color: #DC2626; color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 6px; font-weight: bold; cursor: pointer; margin-bottom: 0.75rem; margin-top: 1rem;">Prøv Igen</button>
                        <span style="color: #DC2626; font-size: 0.95rem;">Prøv venligst igen.</span>
                    </div>
                \`;
                
                const retryBtn = document.getElementById('retryFeedbackBtn');
                if (retryBtn) {
                    retryBtn.addEventListener('click', calculateAndPlot);
                }
                
                feedbackMessage.style.transition = 'opacity 0.5s ease';
                feedbackMessage.style.opacity = '1';
            }, 50);
        }
    }
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
    console.log('Genererer PDF via print...');
    
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
    
    // 3. Populate Visual Diamond (Page 3)
    const pdfDiamondContent = document.getElementById('pdf-diamond-content');
    if (pdfDiamondContent) {
        const weightGroups = {
            3: [],
            2: [],
            1: [],
            0.5: [],
            0: []
        };
        mirrorState.forEach(slot => {
            const cardObj = cards.find(c => c.id == slot.cardId);
            if (cardObj && weightGroups[slot.weight] !== undefined) {
                weightGroups[slot.weight].push(cardObj);
            }
        });

        const getBgColor = (quadrant) => {
            if (quadrant === 'AT') return '#ecfdf5'; // light emerald
            if (quadrant === 'TB') return '#f0fdfa'; // light teal
            if (quadrant === 'IR') return '#fefce8'; // light yellow
            if (quadrant === 'SA') return '#faf5ff'; // light purple
            return '#f8fafc';
        };

        const getBorderColor = (quadrant) => {
            if (quadrant === 'AT') return '#10b981'; // emerald
            if (quadrant === 'TB') return '#14b8a6'; // teal
            if (quadrant === 'IR') return '#eab308'; // yellow
            if (quadrant === 'SA') return '#a855f7'; // purple
            return '#cbd5e1';
        };

        const createCardHTML = (cardObj) => {
            const bg = getBgColor(cardObj.quadrant);
            const border = getBorderColor(cardObj.quadrant);
            return \`
                <div style="background-color: \${bg}; border: 1px solid \${border}; border-radius: 6px; padding: 1rem; width: 150px; height: 110px; display: flex; align-items: center; justify-content: center; text-align: center; font-size: 0.75rem; font-weight: 600; color: #1e293b; box-shadow: 0 1px 2px rgba(0,0,0,0.05); overflow: hidden; font-family: Montserrat, sans-serif; box-sizing: border-box; line-height: 1.3;">
                    \${cardObj.text}
                </div>
            \`;
        };

        const levels = [
            { w: 3 },
            { w: 2 },
            { w: 1 },
            { w: 0.5 },
            { w: 0 }
        ];

        let diamondHtml = '<div style="display: flex; flex-direction: column; align-items: center; gap: 1.5rem; width: 100%; padding: 1rem 0;">';
        levels.forEach(l => {
            const rowCards = weightGroups[l.w];
            if (rowCards.length > 0) {
                diamondHtml += \`<div style="display: flex; gap: 1.5rem; justify-content: center;">\`;
                rowCards.forEach(c => {
                    diamondHtml += createCardHTML(c);
                });
                diamondHtml += \`</div>\`;
            }
        });
        diamondHtml += '</div>';
        pdfDiamondContent.innerHTML = diamondHtml;
    }

    // Call native browser print
    window.print();
}

// Start app
document.addEventListener('DOMContentLoaded', init);
