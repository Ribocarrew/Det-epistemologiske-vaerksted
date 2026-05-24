document.addEventListener('DOMContentLoaded', () => {
    const startForm = document.getElementById('start-form');
    const startBtn = document.getElementById('start-btn');
    const startBtnText = document.getElementById('start-btn-text');
    const startBtnIcon = document.getElementById('start-btn-icon');
    const startBtnSpinner = document.getElementById('start-btn-spinner');
    const continueBtn = document.getElementById('continue-btn');
    const titleInput = document.getElementById('course-title');
    const intentionInput = document.getElementById('course-intention');
    const charCount = document.getElementById('char-count');
    const formError = document.getElementById('form-error');

    // Tjekker om der er gemt data i localStorage
    const hasData = localStorage.getItem('epistemologisk_selected_cards') || 
                    localStorage.getItem('epistemologisk_mirror_state') || 
                    localStorage.getItem('epistemologisk_tech_role');
    
    if (hasData) {
        continueBtn.style.display = 'inline-flex';
    }

    continueBtn.addEventListener('click', () => {
        window.location.href = 'bibliotek.html';
    });

    // Character counter
    intentionInput.addEventListener('input', () => {
        const length = intentionInput.value.length;
        charCount.textContent = `${length} / 1000 tegn`;
        if (length > 950) {
            charCount.style.color = '#DC2626';
        } else {
            charCount.style.color = 'var(--color-muted)';
        }
    });

    // Handle form submit
    startForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const title = titleInput.value.trim();
        const intention = intentionInput.value.trim();
        
        if (!title || !intention) return;

        // Reset previous run data
        localStorage.clear();

        // Save new course basic data
        localStorage.setItem('epistemologisk_course_title', title);
        localStorage.setItem('epistemologisk_course_intention', intention);

        // UI Loading state
        startBtn.disabled = true;
        titleInput.disabled = true;
        intentionInput.disabled = true;
        startBtnIcon.classList.add('hidden');
        startBtnSpinner.classList.remove('hidden');
        startBtnText.textContent = "✨ AI'en bygger dine kort...";
        formError.style.display = 'none';

        try {
            const response = await fetch('/api/generate-cards', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ intention })
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ error: "Kunne ikke læse fejl-JSON" }));
                throw new Error(errorData.error || `Serverfejl: ${response.status}`);
            }

            const data = await response.json();
            
            // data.cards should be an array of generated cards
            if (data.cards && Array.isArray(data.cards) && data.cards.length > 0) {
                // Map generated cards to the expected format
                const starterCards = data.cards.map((card, index) => {
                    let quadrant = 'TB';
                    if (card.x < 0 && card.y < 0) quadrant = 'IR';
                    else if (card.x < 0 && card.y >= 0) quadrant = 'AT';
                    else if (card.x >= 0 && card.y < 0) quadrant = 'SA';

                    return {
                        id: 200 + index, // Use 200+ ID range for AI starter cards
                        text: card.text,
                        description: card.description || `AI Analyse: ${card.begrundelse}`,
                        quadrant: quadrant,
                        x: card.x,
                        y: card.y,
                        isStarterAI: true // special flag for rendering
                    };
                });
                
                // Save generated cards to localStorage so the bibliotek can pick them up
                localStorage.setItem('epistemologisk_starter_cards', JSON.stringify(starterCards));
            }

            // Successfully finished, redirect
            window.location.href = 'bibliotek.html';

        } catch (error) {
            console.error("AI Generation Error:", error);
            
            // Fallback UX: Don't block the user. Show a friendly message and proceed.
            formError.textContent = "AI'en kunne desværre ikke generere kort lige nu. Du sendes videre til biblioteket...";
            formError.style.color = '#D97706'; // Warning orange instead of error red
            formError.style.display = 'inline';
            
            startBtnText.textContent = "Videre...";
            startBtnSpinner.classList.add('hidden');
            
            setTimeout(() => {
                window.location.href = 'bibliotek.html';
            }, 2500);
        }
    });
});
