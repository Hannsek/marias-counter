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
const gameButtons = document.querySelectorAll('.game-button');
const trumfButtons = document.querySelectorAll('.trumf-button');
const forhontButtons = document.querySelectorAll('.forhont-button');
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
const resetButton = document.getElementById('resetScores');
const historyTableBody = document.getElementById('historyTableBody');

// Add reset functionality with confirmation
let resetClickTimeout;

function resetScores() {
    // Reset all player scores
    players.forEach(player => player.score = 0);
    // Reset flek multiplier
    currentFlekMultiplier = 1;
    // Update displays
    updateDisplay();
    currentFlekDisplay.textContent = `${currentFlekMultiplier}×`;
    updateFlekButtons();
    // Reset button state
    resetButton.textContent = 'Vynulovat skóre';
    resetButton.classList.remove('confirm');
    
    // Clear history table
    historyTableBody.innerHTML = '';
}

resetButton.addEventListener('click', () => {
    if (resetButton.classList.contains('confirm')) {
        // Second click - perform reset
        resetScores();
        clearTimeout(resetClickTimeout);
    } else {
        // First click - ask for confirmation
        resetButton.textContent = 'Opravdu vynulovat?';
        resetButton.classList.add('confirm');
        
        // Reset button state after 3 seconds if not confirmed
        resetClickTimeout = setTimeout(() => {
            resetButton.textContent = 'Vynulovat skóre';
            resetButton.classList.remove('confirm');
        }, 3000);
    }
});

// Track current selections
let currentGame = 'hra';
let currentTrumf = 'cerveny';
let currentForhont = '0';

// Helper function to handle button groups
function setActiveButton(buttons, activeButton) {
    buttons.forEach(button => button.classList.remove('active'));
    activeButton.classList.add('active');
}

// Add event listeners for game type
gameButtons.forEach(button => {
    button.addEventListener('click', () => {
        setActiveButton(gameButtons, button);
        currentGame = button.dataset.game;
        
        // Show/hide trumf buttons for Betl/Durch
        const trumfSection = document.querySelector('.trumf-color');
        trumfSection.style.display = 
            ['betl', 'durch'].includes(currentGame) ? 'none' : 'block';
    });
});

// Add event listeners for trumf
trumfButtons.forEach(button => {
    button.addEventListener('click', () => {
        setActiveButton(trumfButtons, button);
        currentTrumf = button.dataset.trumf;
    });
});

// Add event listeners for forhont
forhontButtons.forEach(button => {
    button.addEventListener('click', () => {
        setActiveButton(forhontButtons, button);
        currentForhont = button.dataset.player;
    });
});

// Calculate game value
function calculateGameValue() {
    let value = GAME_VALUES[currentGame] * BASE_RATE;
    
    if (currentTrumf === 'cerveny') {
        value *= 2;
    }
    
    return value * currentFlekMultiplier;
}

// Define a function to reset buttons to default
function resetButtonsToDefault() {
    // Reset game type to 'hra'
    const defaultGameButton = document.querySelector('.game-button[data-game="hra"]');
    setActiveButton(gameButtons, defaultGameButton);
    currentGame = 'hra';

    // Move forhont to next player
    const nextForhontIndex = (parseInt(currentForhont) + 1) % 3;  // Cycle through 0,1,2
    const nextForhontButton = document.querySelector(`.forhont-button[data-player="${nextForhontIndex}"]`);
    setActiveButton(forhontButtons, nextForhontButton);
    currentForhont = nextForhontIndex.toString();

    // Reset flek multiplier to 1
    currentFlekMultiplier = 1;
    currentFlekDisplay.textContent = `${currentFlekMultiplier}×`;
    updateFlekButtons();

    // Reset flek button highlighting
    Object.values(flekButtons).forEach(button => {
        button.classList.remove('active');
    });
    flekButtons.reset.classList.add('active');
}
// Modify the updateScores function to reset buttons
function updateScores(forhontWon) {
    const gameValue = calculateGameValue();
    const forhontIndex = parseInt(currentForhont);
    
    addGameToHistory(forhontWon);
    
    if (forhontWon) {
        players.forEach((player, index) => {
            if (index === forhontIndex) {
                player.score += gameValue * 2;
            } else {
                player.score -= gameValue;
            }
        });
    } else {
        players.forEach((player, index) => {
            if (index === forhontIndex) {
                player.score -= gameValue * 2;
            } else {
                player.score += gameValue;
            }
        });
    }
    
    updateDisplay();
    
    // Reset buttons to default after updating scores
    resetButtonsToDefault();
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

// Fleky 
function updateFlekButtons() {
    const buttons = [flekButtons.flek, flekButtons.re, flekButtons.tutti, flekButtons.boty, flekButtons.kalhoty];
    buttons.forEach((button, index) => {
        button.disabled = currentFlekMultiplier >= FLEK_MULTIPLIERS[button.id];
    });
}

flekButtons.reset.addEventListener('click', () => {
    currentFlekMultiplier = 1;
    currentFlekDisplay.textContent = `${currentFlekMultiplier}×`;
    // Remove active class from all flek buttons
    Object.values(flekButtons).forEach(button => {
        button.classList.remove('active');
    });
    // Add active class to reset button
    flekButtons.reset.classList.add('active');
    updateFlekButtons();
});

Object.entries(FLEK_MULTIPLIERS).forEach(([key, multiplier]) => {
    flekButtons[key].addEventListener('click', () => {
        currentFlekMultiplier = multiplier;
        currentFlekDisplay.textContent = `${currentFlekMultiplier}×`;
        // Remove active class from all flek buttons
        Object.values(flekButtons).forEach(button => {
            button.classList.remove('active');
        });
        // Add active class to clicked button
        flekButtons[key].classList.add('active');
        updateFlekButtons();
    });
});

function savePlayerNames() {
    const names = Array.from(playerNames).map(nameElement => nameElement.textContent);
    localStorage.setItem('playerNames', JSON.stringify(names));
    
    // Update forhont select options
    const forhontOptions = Array.from(forhontButtons);
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
        const forhontOptions = Array.from(forhontButtons);
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

// Add this function to record games
function addGameToHistory(isWin) {
    const gameButton = document.querySelector(`.game-button[data-game="${currentGame}"]`);
    const trumfButton = document.querySelector(`.trumf-button[data-trumf="${currentTrumf}"]`);
    const forhontButton = document.querySelector(`.forhont-button[data-player="${currentForhont}"]`);
    const gameValue = calculateGameValue();
    
    const row = document.createElement('tr');
    row.innerHTML = `
        <td>${gameButton.textContent}</td>
        <td>${['betl', 'durch'].includes(currentGame) ? '-' : trumfButton.textContent}</td>
        <td>${forhontButton.textContent}</td>
        <td>${currentFlekMultiplier}×</td>
        <td class="${isWin ? 'win' : 'lose'}">${isWin ? 'Výhra' : 'Prohra'}</td>
        <td>${gameValue} Kč</td>
    `;
    
    historyTableBody.insertBefore(row, historyTableBody.firstChild);
}
// Set initial active buttons
document.querySelector('.game-button[data-game="hra"]').classList.add('active');
document.querySelector('.trumf-button[data-trumf="cerveny"]').classList.add('active');
document.querySelector('.forhont-button[data-player="0"]').classList.add('active');

