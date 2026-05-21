import { cards } from './cards.js';

// State to store selected card IDs
let selectedCards = [];

// DOM Elements
const mainGrid = document.getElementById('main-cards-grid');
const aiCardsGrid = document.getElementById('ai-cards-grid');
const aiStarterGrid = document.getElementById('ai-starter-grid');
const aiStarterSection = document.getElementById('ai-starter-section');
const countElement = document.getElementById('count');
const counterContainer = document.getElementById('counter');
const nextBtn = document.getElementById('nextBtn');
const errorMessage = document.getElementById('error-message');
const aiBtn = document.getElementById('ai-btn');
const aiInput = document.getElementById('ai-input');
const aiSpinner = document.getElementById('ai-spinner');
const aiBtnText = document.getElementById('ai-btn-text');

// Load any previously saved state
let customCards = [];
const savedCustom = localStorage.getItem('epistemologisk_custom_cards');
if (savedCustom) {
    try {
        customCards = JSON.parse(savedCustom);
        cards.push(...customCards);
    } catch(e) {}
}

let starterCards = [];
const savedStarter = localStorage.getItem('epistemologisk_starter_cards');
if (savedStarter) {
    try {
        starterCards = JSON.parse(savedStarter);
        cards.push(...starterCards);
    } catch(e) {}
}

const savedState = localStorage.getItem('epistemologisk_selected_cards');
if (savedState) {
    try {
        selectedCards = JSON.parse(savedState);
    } catch (e) {
        console.error("Could not parse saved cards", e);
    }
}

// Checkmark SVG
const checkmarkSvg = `
<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
    <polyline points="20 6 9 17 4 12"></polyline>
</svg>
`;

// Initialize UI
function init() {
    // Bland kortene så de ikke vises grupperet
    cards.sort(() => Math.random() - 0.5);
    
    renderCards();
    updateUI();
    
    nextBtn.addEventListener('click', () => {
        if (selectedCards.length === 9) {
            localStorage.setItem('epistemologisk_selected_cards', JSON.stringify(selectedCards));
            // Navigate to next step (Spejlet) - assuming spejlet.html will be created next
            window.location.href = 'spejlet.html'; 
        }
    });
    
    // AI Custom Card Event
    aiBtn.addEventListener('click', handleAICard);
}

// Group and render cards
function renderCards() {
    cards.forEach(card => {
        const cardEl = document.createElement('div');
        const cssClass = card.quadrant.toLowerCase();
        
        cardEl.className = `play-card ${cssClass}`;
        if (selectedCards.includes(card.id)) {
            cardEl.classList.add('selected');
        }
        
        // Asymmetrisk højde til masonry grid
        const randomHeight = Math.floor(Math.random() * 80) + 180;
        cardEl.style.height = `${randomHeight}px`;
        
        cardEl.innerHTML = `
            <div class="card-inner">
                <div class="card-front">
                    <div class="card-id">${card.id}</div>
                    <h3>${card.text}</h3>
                    <button class="info-btn front-info" title="Læs teoretisk uddybning" aria-label="Vis teori">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
                    </button>
                    <div class="checkmark">${checkmarkSvg}</div>
                </div>
                <div class="card-back">
                    <p style="font-family: var(--font-heading); font-weight: 700; margin-bottom: 0.5rem; font-size: 0.95rem;">Teoretisk uddybning</p>
                    <p>${card.description}</p>
                    <button class="info-btn back-info" title="Vend tilbage" aria-label="Skjul teori">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 12H5"></path><path d="M12 19l-7-7 7-7"></path></svg>
                    </button>
                </div>
            </div>
        `;
        
        const frontBtn = cardEl.querySelector('.front-info');
        const backBtn = cardEl.querySelector('.back-info');
        
        frontBtn.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent selecting the card when just wanting to flip
            cardEl.classList.add('flipped');
        });
        
        backBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            cardEl.classList.remove('flipped');
        });
        
        // The rest of the card acts as the selection area
        cardEl.addEventListener('click', () => {
            // Only toggle selection if it's not currently flipped
            if (!cardEl.classList.contains('flipped')) {
                toggleCard(card.id, cardEl);
            }
        });
        
        // Append to correct grid
        if (card.isStarterAI) {
            aiStarterGrid.appendChild(cardEl);
        } else if (card.isCustom) {
            aiCardsGrid.appendChild(cardEl);
        } else {
            mainGrid.appendChild(cardEl);
        }
    });

    if (starterCards && starterCards.length > 0) {
        aiStarterSection.style.display = 'block';
    }
}

// Toggle a card selection
function toggleCard(id, element) {
    errorMessage.classList.add('hidden'); // Hide error on any click
    
    const index = selectedCards.indexOf(id);
    if (index === -1) {
        // Trying to add
        if (selectedCards.length >= 9) {
            // Reject if already 9
            errorMessage.classList.remove('hidden');
            // Little shake animation on error
            errorMessage.animate([
                { transform: 'translateX(0)' },
                { transform: 'translateX(-10px)' },
                { transform: 'translateX(10px)' },
                { transform: 'translateX(-10px)' },
                { transform: 'translateX(10px)' },
                { transform: 'translateX(0)' }
            ], { duration: 400, easing: 'ease-in-out' });
            return;
        }
        selectedCards.push(id);
        element.classList.add('selected');
    } else {
        // Trying to remove
        selectedCards.splice(index, 1);
        element.classList.remove('selected');
    }
    
    updateUI();
    // Save state on every change
    localStorage.setItem('epistemologisk_selected_cards', JSON.stringify(selectedCards));
}

// Update counters and button visibility
function updateUI() {
    const count = selectedCards.length;
    countElement.textContent = count;
    
    if (count === 9) {
        counterContainer.classList.add('complete');
        nextBtn.classList.remove('hidden');
    } else {
        counterContainer.classList.remove('complete');
        nextBtn.classList.add('hidden');
    }
}

// AI Custom Card Logic
async function handleAICard() {
    const text = aiInput.value.trim();
    if (!text) return;

    if (selectedCards.length >= 9) {
        errorMessage.textContent = "Du har allerede valgt 9 kort. Fravælg et kort for at tilføje dit eget.";
        errorMessage.classList.remove('hidden');
        return;
    }

    // UI Loading state
    aiBtn.disabled = true;
    aiInput.disabled = true;
    aiSpinner.classList.remove('hidden');
    aiBtnText.textContent = "Analyserer med Gemini...";
    errorMessage.classList.add('hidden');

    try {
        const response = await fetch('/api/analyze', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text })
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ error: "Kunne ikke læse fejl-JSON" }));
            throw new Error(errorData.error || `Serverfejl: ${response.status}`);
        }

        const data = await response.json();

        // Determine quadrant based on X and Y
        let quadrant = 'TB';
        if (data.x < 0 && data.y < 0) quadrant = 'IR';
        else if (data.x < 0 && data.y >= 0) quadrant = 'AT';
        else if (data.x >= 0 && data.y < 0) quadrant = 'SA';

        const newCard = {
            id: 100 + customCards.length,
            text: text,
            description: `AI Analyse: ${data.begrundelse}`,
            quadrant: quadrant,
            x: data.x,
            y: data.y,
            isCustom: true
        };

        // Save
        customCards.push(newCard);
        cards.push(newCard);
        localStorage.setItem('epistemologisk_custom_cards', JSON.stringify(customCards));
        
        // Automatically select the new card
        selectedCards.push(newCard.id);
        localStorage.setItem('epistemologisk_selected_cards', JSON.stringify(selectedCards));

        // Reset UI
        aiInput.value = "";
        aiBtn.disabled = false;
        aiInput.disabled = false;
        aiSpinner.classList.add('hidden');
        aiBtnText.textContent = "Analyser og tilføj kort";

        // Re-render
        if (mainGrid) mainGrid.innerHTML = ''; 
        if (aiCardsGrid) aiCardsGrid.innerHTML = '';
        renderCards();
        updateUI();

    } catch (error) {
        console.error(error);
        errorMessage.textContent = error.message;
        errorMessage.classList.remove('hidden');
        
        aiBtn.disabled = false;
        aiInput.disabled = false;
        aiSpinner.classList.add('hidden');
        aiBtnText.textContent = "Prøv igen";
    }
}

// Run
init();
