import { cards } from './cards.js';

// DOM Elements
const poolEl = document.getElementById('pool');
const slots = Array.from(document.querySelectorAll('.slot'));
const instructionBox = document.getElementById('instruction-box');
const instructionText = document.getElementById('instruction-text');
const nextBtn = document.getElementById('nextBtn');

// Load selected card IDs from Trin 1
const savedState = localStorage.getItem('epistemologisk_selected_cards');
let selectedCardIds = [];

if (savedState) {
    try {
        selectedCardIds = JSON.parse(savedState);
    } catch (e) {
        console.error("Parse error", e);
    }
}

// Redirect if not exactly 9 cards
if (!selectedCardIds || selectedCardIds.length !== 9) {
    window.location.replace('bibliotek.html');
} else {
    // Load custom cards
    const savedCustom = localStorage.getItem('epistemologisk_custom_cards');
    if (savedCustom) {
        try {
            const customCards = JSON.parse(savedCustom);
            cards.push(...customCards);
        } catch(e) {}
    }

    // Map IDs to full card objects
    const selectedCards = selectedCardIds.map(id => cards.find(c => c.id === id)).filter(Boolean);

    // Initialize
    function init() {
        renderPool();
        initSortable();
        
        // Restore in-progress state if any
        const savedInProgress = localStorage.getItem('epistemologisk_in_progress_mirror');
        if (savedInProgress) {
            try {
                const inProgressState = JSON.parse(savedInProgress);
                inProgressState.forEach((cardId, index) => {
                    if (cardId !== null) {
                        const cardEl = poolEl.querySelector(`[data-id="${cardId}"]`);
                        if (cardEl) {
                            slots[index].appendChild(cardEl);
                        }
                    }
                });
            } catch(e) {}
        }
        
        updateState();
        
        nextBtn.addEventListener('click', saveAndProceed);
        
        // Test helper
        document.getElementById('testAutoFill')?.addEventListener('click', () => {
            const pCards = Array.from(poolEl.children);
            slots.forEach((slot, index) => {
                if (pCards[index]) slot.appendChild(pCards[index]);
            });
            updateState();
        });
    }

    function renderPool() {
        selectedCards.forEach(card => {
            const cardEl = document.createElement('div');
            const cssClass = card.quadrant.toLowerCase();
            
            cardEl.className = `mini-card ${cssClass}`;
            cardEl.dataset.id = card.id; // Save ID for state mapping later
            cardEl.dataset.quadrant = card.quadrant;
            cardEl.dataset.x = card.x;
            cardEl.dataset.y = card.y;
            
            cardEl.innerHTML = `
                <span class="card-badge">Kort ${card.id}</span>
                <h4>${card.text}</h4>
            `;
            
            poolEl.appendChild(cardEl);
        });
    }

    function initSortable() {
        const animationSpeed = 400; // Slower drop animation for 'reflective friction'
        
        // Sortable for the Pool
        new Sortable(poolEl, {
            group: 'shared',
            animation: animationSpeed,
            ghostClass: 'sortable-ghost',
            dragClass: 'sortable-drag',
            scroll: true,
            scrollSensitivity: 40,
            scrollSpeed: 15,
            onAdd: updateState,
            onRemove: updateState
        });
        
        // Sortable for each Diamond Slot
        slots.forEach(slot => {
            new Sortable(slot, {
                group: {
                    name: 'shared',
                    put: function (to) {
                        return to.el.children.length === 0;
                    }
                },
                animation: animationSpeed,
                ghostClass: 'sortable-ghost',
                dragClass: 'sortable-drag',
                scroll: true,
                scrollSensitivity: 40,
                scrollSpeed: 15,
                onAdd: updateState,
                onRemove: updateState
            });
        });
    }

    function updateState() {
        // Count how many cards are currently in the slots
        const filledSlotsCount = slots.filter(slot => slot.children.length > 0).length;
        
        // Update Instruction Box
        instructionBox.className = 'instruction-box'; // reset
        
        if (filledSlotsCount === 0) {
            instructionBox.classList.add('neutral');
            instructionText.textContent = 'Træk dine 9 kort ned i diamanten.';
            nextBtn.classList.add('hidden');
        } else if (filledSlotsCount > 0 && filledSlotsCount < 9) {
            instructionBox.classList.add('active');
            instructionText.textContent = `Du er i gang... (${filledSlotsCount}/9 placeret)`;
            nextBtn.classList.add('hidden');
        } else if (filledSlotsCount === 9) {
            instructionBox.classList.add('complete');
            instructionText.textContent = 'Spejlet er udfyldt!';
            nextBtn.classList.remove('hidden');
        }

        // Save in progress state
        const inProgressState = slots.map(slot => {
            if (slot.children.length > 0) {
                return parseInt(slot.children[0].dataset.id);
            }
            return null;
        });
        localStorage.setItem('epistemologisk_in_progress_mirror', JSON.stringify(inProgressState));
    }

    function saveAndProceed() {
        // Collect the final sorting configuration
        const mirrorState = slots.map(slot => {
            const cardEl = slot.children[0];
            return {
                weight: parseFloat(slot.dataset.weight),
                cardId: parseInt(cardEl.dataset.id),
                quadrant: cardEl.dataset.quadrant,
                x: parseInt(cardEl.dataset.x),
                y: parseInt(cardEl.dataset.y)
            };
        });
        
        // Save to global state
        localStorage.setItem('epistemologisk_mirror_state', JSON.stringify(mirrorState));
        
        // Proceed to Step 3.5
        window.location.href = 'trin35.html'; 
    }

    init();
}
