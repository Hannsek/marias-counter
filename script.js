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
    { name: "Hráč 1", score: 0 },
    { name: "Hráč 2", score: 0 },
    { name: "Hráč 3", score: 0 }
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
const resetStorageButton = document.getElementById('resetStorage');

// Simplify resetScores function
function resetScores() {
    // Reset all player scores
    players.forEach(player => player.score = 0);

    // Reset game type to 'hra'
    const defaultGameButton = document.querySelector('.game-button[data-game="hra"]');
    setActiveButton(gameButtons, defaultGameButton);
    currentGame = 'hra';

    // Reset forhont to Player 1 (index 0)
    const firstForhontButton = document.querySelector('.forhont-button[data-player="0"]');
    setActiveButton(forhontButtons, firstForhontButton);
    currentForhont = '0';

    // Reset flek multiplier to 1
    currentFlekMultiplier = 1;
    currentFlekDisplay.textContent = `${currentFlekMultiplier}×`;
    updateFlekButtons();
    
    // Update displays
    updateDisplay();
    
    // Clear history table
    historyTableBody.innerHTML = '';
}

// Simplify reset button click handler
resetButton.addEventListener('click', () => {
    resetScores();
});

// Simplify reset storage button click handler
resetStorageButton.addEventListener('click', () => {
    localStorage.clear();
    
    // Reset player names to defaults
    playerNames.forEach((nameElement, index) => {
        nameElement.textContent = `Hráč ${index + 1}`;
    });
    
    // Update everything
    savePlayerNames();
    resetScores();
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

// Safer game value calculation
function calculateGameValue() {
    const baseValue = GAME_VALUES[currentGame] || 0;
    const trumfMultiplier = currentTrumf === 'cerveny' ? 2 : 1;
    return baseValue * BASE_RATE * trumfMultiplier * currentFlekMultiplier;
}

// Define a function to reset buttons to default
function resetButtonsToDefault(moveForhont = true) {
    // Reset game type to 'hra'
    const defaultGameButton = document.querySelector('.game-button[data-game="hra"]');
    setActiveButton(gameButtons, defaultGameButton);
    currentGame = 'hra';

    if (moveForhont) {
        // Move forhont to next player only if moveForhont is true
        const nextForhontIndex = (parseInt(currentForhont) + 1) % 3;
        const nextForhontButton = document.querySelector(`.forhont-button[data-player="${nextForhontIndex}"]`);
        setActiveButton(forhontButtons, nextForhontButton);
        currentForhont = nextForhontIndex.toString();
    }

    // Reset flek multiplier to 1
    currentFlekMultiplier = 1;
    currentFlekDisplay.textContent = `${currentFlekMultiplier}×`;
    updateFlekButtons();
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
                animateScore(index);
            } else {
                player.score -= gameValue;
                animateScore(index);
            }
        });
    } else {
        players.forEach((player, index) => {
            if (index === forhontIndex) {
                player.score -= gameValue * 2;
                animateScore(index);
            } else {
                player.score += gameValue;
                animateScore(index);
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

    // Create or update sum row in history table
    let sumRow = document.getElementById('historySum');
    if (!sumRow) {
        sumRow = document.createElement('tr');
        sumRow.id = 'historySum';
        historyTableBody.appendChild(sumRow);
    }

    sumRow.innerHTML = `
        <td colspan="6" style="text-align: right; font-weight: bold;">Součet:</td>
        <td class="${players[0].score > 0 ? 'win' : 'lose'}" style="font-weight: bold;">${players[0].score > 0 ? '+' : ''}${players[0].score} Kč</td>
        <td class="${players[1].score > 0 ? 'win' : 'lose'}" style="font-weight: bold;">${players[1].score > 0 ? '+' : ''}${players[1].score} Kč</td>
        <td class="${players[2].score > 0 ? 'win' : 'lose'}" style="font-weight: bold;">${players[2].score > 0 ? '+' : ''}${players[2].score} Kč</td>
    `;
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
        animateFlekMultiplier();
        // Remove active class from all flek buttons
        Object.values(flekButtons).forEach(button => {
            button.classList.remove('active');
        });
        // Add active class to clicked button
        flekButtons[key].classList.add('active');
        updateFlekButtons();
    });
});

// Add this function to update table headers when player names change
function updateTableHeaders() {
    const headers = document.querySelectorAll('.game-history th');
    const playerNames = document.querySelectorAll('.player-name');
    
    // Update last three headers with player names
    headers[6].textContent = playerNames[0].textContent;
    headers[7].textContent = playerNames[1].textContent;
    headers[8].textContent = playerNames[2].textContent;
}

// Modify savePlayerNames function
function savePlayerNames() {
    const names = Array.from(playerNames).map(nameElement => nameElement.textContent);
    localStorage.setItem('playerNames', JSON.stringify(names));
    
    // Update forhont buttons
    const forhontOptions = Array.from(forhontButtons);
    forhontOptions.forEach((option, index) => {
        option.textContent = names[index];
    });

    // Update table headers
    updateTableHeaders();
}

// Add to loadPlayerNames function
function loadPlayerNames() {
    const savedNames = localStorage.getItem('playerNames');
    if (savedNames) {
        const names = JSON.parse(savedNames);
        playerNames.forEach((nameElement, index) => {
            nameElement.textContent = names[index];
        });
        
        // Update forhont buttons
        const forhontOptions = Array.from(forhontButtons);
        forhontOptions.forEach((option, index) => {
            option.textContent = names[index];
        });

        // Update table headers
        updateTableHeaders();
    }
}

// Add this function to handle name length limits
function limitNameLength(element, maxLength = 8) {
    if (element.textContent.length > maxLength) {
        element.textContent = element.textContent.slice(0, maxLength);
        // Move cursor to end
        const range = document.createRange();
        const selection = window.getSelection();
        range.selectNodeContents(element);
        range.collapse(false);
        selection.removeAllRanges();
        selection.addRange(range);
    }
}

// Update the event listeners for player names
playerNames.forEach(nameElement => {
    // Add input event to check length while typing
    nameElement.addEventListener('input', () => {
        limitNameLength(nameElement);
    });

    // Keep existing blur event for saving
    nameElement.addEventListener('blur', () => {
        limitNameLength(nameElement);  // Ensure limit on blur
        savePlayerNames();
    });

    // Keep existing enter key handler
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
    const forhontIndex = parseInt(currentForhont);

    // Calculate value changes for each player
    const playerChanges = players.map((_, index) => {
        if (isWin) {
            return index === forhontIndex ? gameValue * 2 : -gameValue;
        } else {
            return index === forhontIndex ? -gameValue * 2 : gameValue;
        }
    });
    
    const row = document.createElement('tr');
    row.innerHTML = `
        <td>${gameButton.textContent}</td>
        <td>${['betl', 'durch'].includes(currentGame) ? '-' : trumfButton.textContent}</td>
        <td>${forhontButton.textContent}</td>
        <td>${currentFlekMultiplier}×</td>
        <td class="${isWin ? 'win' : 'lose'}">${isWin ? 'Výhra' : 'Prohra'}</td>
        <td>${gameValue} Kč</td>
        <td class="${playerChanges[0] > 0 ? 'win' : 'lose'}">${playerChanges[0] > 0 ? '+' : ''}${playerChanges[0]}</td>
        <td class="${playerChanges[1] > 0 ? 'win' : 'lose'}">${playerChanges[1] > 0 ? '+' : ''}${playerChanges[1]}</td>
        <td class="${playerChanges[2] > 0 ? 'win' : 'lose'}">${playerChanges[2] > 0 ? '+' : ''}${playerChanges[2]}</td>
    `;
    
    historyTableBody.insertBefore(row, historyTableBody.firstChild);
    
    // Use updateDisplay instead of updateHistorySums
    updateDisplay();
}
// Set initial active buttons
document.querySelector('.game-button[data-game="hra"]').classList.add('active');
document.querySelector('.trumf-button[data-trumf="cerveny"]').classList.add('active');
document.querySelector('.forhont-button[data-player="0"]').classList.add('active');

// Add this function to handle score animations
function animateScore(index) {
    const scoreElement = document.querySelectorAll('.score')[index];
    scoreElement.classList.add('animate');
    setTimeout(() => scoreElement.classList.remove('animate'), 300);
}

// Add this function to handle flek multiplier animation
function animateFlekMultiplier() {
    const flekElement = document.querySelector('.current-flek');
    flekElement.classList.add('animate');
    setTimeout(() => flekElement.classList.remove('animate'), 300);
}

// Safer service worker registration
if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
        navigator.serviceWorker.register('/sw.js').catch(function(error) {
            console.error('ServiceWorker registration failed:', error);
        });
    });
}

