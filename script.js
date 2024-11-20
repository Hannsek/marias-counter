// Game constants
const BASE_RATE = 1; // 1 Kč base rate
const GAME_VALUES = {
    hra: 1,
    sedma: 2,
    sto: 4,
    betl: 15,
    durch: 30
};

let currentFlekMultiplier = 1;
const FLEK_MULTIPLIERS = {
    'flek': 2,
    're': 4,
    'tutti': 8,
    'boty': 16,
    'kalhoty': 32
};


// State management
let players = [
    { name: "Player 1", score: 0 },
    { name: "Player 2", score: 0 },
    { name: "Player 3", score: 0 }
];

// Document Object Model (DOM) Elements
const gameTypeSelect = document.getElementById('gameType');
const trumfColorSelect = document.getElementById('trumfColor');
const forhontSelect = document.getElementById('forhont');
const winButton = document.getElementById('win');
const loseButton = document.getElementById('lose');
const flekButtons = {
    reset: document.getElementById('resetFlek'),
    flek: document.getElementById('flek'),
    re: document.getElementById('re'),
    tutti: document.getElementById('tutti'),
    boty: document.getElementById('boty'),
    kalhoty: document.getElementById('kalhoty')
};
const currentFlekDisplay = document.querySelector('.current-flek');
const playerNames = document.querySelectorAll('.player-name');



// Calculate game value
function calculateGameValue() {
    const gameType = gameTypeSelect.value;
    const trumfColor = trumfColorSelect.value;
    let value = GAME_VALUES[gameType] * BASE_RATE;
    
    // Double the value for červené
    if (trumfColor === 'cerveny') {
    value *= 2;
    }
    return value;
}

// Update scores
function updateScores(forhontWon) {
    const gameValue = calculateGameValue();
    const forhontIndex = parseInt(forhontSelect.value);
    
    if (forhontWon) {
        // Forhont wins - others pay
        players.forEach((player, index) => {
            if (index === forhontIndex) {
                player.score += gameValue * 2; // Gets paid by both players
            } else {
                player.score -= gameValue; // Pays the winner
            }
        });
    } else {
        // Forhont loses - pays others
        players.forEach((player, index) => {
            if (index === forhontIndex) {
                player.score -= gameValue * 2; // Pays both players
            } else {
                player.score += gameValue; // Gets paid by loser
            }
        });
    }
    
    updateDisplay();
}

// Update the display
function updateDisplay() {
    const scoreElements = document.querySelectorAll('.score');
    scoreElements.forEach((element, index) => {
        element.textContent = `${players[index].score} Kč`;
    });
}

// Event listeners
winButton.addEventListener('click', () => updateScores(true));
loseButton.addEventListener('click', () => updateScores(false));

// Hide trumf color selection for Betl and Durch
gameTypeSelect.addEventListener('change', () => {
    const gameType = gameTypeSelect.value;
    const trumfColorDiv = document.querySelector('.trumf-color');
    trumfColorDiv.style.display = ['betl', 'durch'].includes(gameType) ? 'none' : 'block';
});

// Fleky 
function updateFlekButtons() {
    const buttons = [flekButtons.flek, flekButtons.re, flekButtons.tutti, flekButtons.boty, flekButtons.kalhoty];
    buttons.forEach((button, index) => {
        button.disabled = currentFlekMultiplier >= FLEK_MULTIPLIERS[button.id];
    });
}

flekButtons.reset.addEventListener('click', () => {
    currentFlekMultiplier = 1;
    currentFlekDisplay.textContent = `Současný flek: ${currentFlekMultiplier}×`;
    updateFlekButtons();
});

Object.entries(FLEK_MULTIPLIERS).forEach(([key, multiplier]) => {
    flekButtons[key].addEventListener('click', () => {
        currentFlekMultiplier = multiplier;
        currentFlekDisplay.textContent = `Současný flek: ${currentFlekMultiplier}×`;
        updateFlekButtons();
    });
});

// Modify calculateGameValue function
function calculateGameValue() {
    const gameType = gameTypeSelect.value;
    const trumfColor = trumfColorSelect.value;
    let value = GAME_VALUES[gameType] * BASE_RATE;
    
    if (trumfColor === 'cerveny') {
        value *= 2;
    }
    
    return value * currentFlekMultiplier;  // Apply flek multiplier
}

function savePlayerNames() {
    const names = Array.from(playerNames).map(nameElement => nameElement.textContent);
    localStorage.setItem('playerNames', JSON.stringify(names));
    
    // Update forhont select options
    const forhontOptions = Array.from(forhontSelect.options);
    forhontOptions.forEach((option, index) => {
        option.textContent = names[index];
    });
}

function loadPlayerNames() {
    const savedNames = localStorage.getItem('playerNames');
    if (savedNames) {
        const names = JSON.parse(savedNames);
        playerNames.forEach((nameElement, index) => {
            nameElement.textContent = names[index];
        });
        
        // Update forhont select options
        const forhontOptions = Array.from(forhontSelect.options);
        forhontOptions.forEach((option, index) => {
            option.textContent = names[index];
        });
    }
}

playerNames.forEach(nameElement => {
    nameElement.addEventListener('blur', savePlayerNames);
    nameElement.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            nameElement.blur();
        }
    });
});

document.addEventListener('DOMContentLoaded', loadPlayerNames);