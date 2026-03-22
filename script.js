/**
 * Wordle Game State
 */
let WORDS_DATA;      // Full dictionary from words.json
let currentWord = ''; // The target word to guess
let currentAttempt = 0; // Current row (0-5)
let currentGuess = ''; // Letters entered in current row
let gameOver = false;
let grid = [];       // Grid state management
let keyboardStates = {}; // Track letter status (correct, present, absent)
let selectedLevel = 'A1-A2';
let tempSelectedLevel = 'A1-A2';
let guessHistory = []; 

/**
 * Mapping CEFR levels to internal dictionary tiers
 */
const levelToTier = {
    'A1-A2': 1,
    'A2-B1': 1.5,
    'B1-B2': 2,
    'C1-C2': 3
};

// Get words with definitions for the selected level
function getWordsWithDefinitions(level = 'Random') {
    if (!WORDS_DATA) {
        console.error('WORDS_DATA is not loaded yet.');
        return [];
    }
    let words = Object.keys(WORDS_DATA).filter(word => 
        WORDS_DATA[word].en && WORDS_DATA[word].en.trim() !== ''
    );

    if (level !== 'Random') {
        const tier = levelToTier[level];
        words = words.filter(word => WORDS_DATA[word].tier === tier);
    }

    return words.length > 0 ? words : Object.keys(WORDS_DATA).filter(word => 
        WORDS_DATA[word].en && WORDS_DATA[word].en.trim() !== ''
    );
}

// Dashboard functions
function showDashboard() {
    tempSelectedLevel = selectedLevel;
    updateLevelSelection();
    document.getElementById('dashboard-overlay').classList.add('show');
}

function closeDashboard() {
    document.getElementById('dashboard-overlay').classList.remove('show');
}

function selectLevel(level) {
    tempSelectedLevel = level;
    updateLevelSelection();
}

function updateLevelSelection() {
    // Remove active class from all options
    document.querySelectorAll('.level-option').forEach(option => {
        option.classList.remove('active');
    });

    // Add active class to selected option
    const levelMap = {
        'A1-A2': 'level-a',
        'A2-B1': 'level-ab',
        'B1-B2': 'level-b',
        'C1-C2': 'level-c',
        'Random': 'level-random'
    };

    const activeElement = document.getElementById(levelMap[tempSelectedLevel]);
    if (activeElement) {
        activeElement.classList.add('active');
    }
}

function applyLevelChange() {
    selectedLevel = tempSelectedLevel;
    document.getElementById('current-level').textContent = selectedLevel;
    closeDashboard();
    startNewGame();
}

// Initialize game
function initGame() {
    if (!WORDS_DATA) {
        console.error('Cannot initialize game: WORDS_DATA is not loaded.');
        showMessage('Error: Word data not loaded. Please try again.');
        return;
    }
    createGrid();
    startNewGame();
    setupKeyboardListener();
}

function createGrid() {
    const gridElement = document.getElementById('grid');
    if (!gridElement) {
        console.error('Grid element not found in the DOM.');
        return;
    }
    gridElement.innerHTML = ''; // Clear existing grid
    grid = [];

    for (let i = 0; i < 6; i++) {
        const row = document.createElement('div');
        row.className = 'row';
        row.id = `row-${i}`;
        const rowData = [];

        // Add tooltip div for mobile
        const rowTooltip = document.createElement('div');
        rowTooltip.className = 'row-tooltip';
        rowTooltip.id = `tooltip-${i}`;
        row.appendChild(rowTooltip);

        for (let j = 0; j < 5; j++) {
            const cell = document.createElement('div');
            cell.className = 'cell';
            cell.id = `cell-${i}-${j}`;
            
            // Add tooltip functionality
            if (window.innerWidth > 600) {
                // Desktop: hover on row
                cell.addEventListener('mouseenter', (e) => showTooltip(e, i));
                cell.addEventListener('mouseleave', hideTooltip);
            } else {
                // Mobile: tap to show/hide
                cell.addEventListener('click', (e) => toggleMobileTooltip(i));
            }
            
            row.appendChild(cell);
            rowData.push({ element: cell, letter: '', state: '' });
        }

        gridElement.appendChild(row);
        grid.push(rowData);
    }
    console.log('Grid created:', grid);
}

function startNewGame() {
    const wordsWithDef = getWordsWithDefinitions(selectedLevel);
    if (wordsWithDef.length === 0) {
        console.error('No valid words with definitions found.');
        showMessage('Error: No valid words available.');
        return;
    }
    currentWord = wordsWithDef[Math.floor(Math.random() * wordsWithDef.length)].toLowerCase();
    currentAttempt = 0;
    currentGuess = '';
    gameOver = false;
    keyboardStates = {};
    guessHistory = [];

    // Reset grid completely
    grid.forEach((row, rowIndex) => {
        row.forEach(cell => {
            // Clear all content and classes
            cell.element.innerHTML = '';
            cell.element.textContent = '';
            cell.element.className = 'cell';
            cell.letter = '';
            cell.state = '';
        });
        // Remove winning animation class and tooltips
        const rowElement = document.getElementById(`row-${rowIndex}`);
        rowElement.classList.remove('winning', 'show-tooltip');
        const tooltipElement = document.getElementById(`tooltip-${rowIndex}`);
        if (tooltipElement) {
            tooltipElement.textContent = '';
        }
    });

    // Reset keyboard
    const keys = document.querySelectorAll('.key');
    keys.forEach(key => {
        if (!key.classList.contains('wide')) {
            key.className = 'key';
        } else {
            key.className = 'key wide';
        }
    });

    // Hide any visible tooltips
    hideTooltip();
    hideAllMobileTooltips();

    updateAttemptDisplay();
    console.log('New word:', currentWord, 'Level:', selectedLevel);
}

function giveUp() {
    if (gameOver) return;
    
    gameOver = true;
    showMessage(`Game Over! The word was: ${currentWord.toUpperCase()}`);
    setTimeout(() => showWordInfo(), 2000);
}

function updateAttemptDisplay() {
    const attemptElement = document.getElementById('current-attempt');
    if (attemptElement) {
        attemptElement.textContent = currentAttempt + 1;
    } else {
        console.error('Current attempt element not found.');
    }
}

function handleKey(letter) {
    if (gameOver) return;
    if (currentGuess.length < 5) {
        currentGuess += letter.toLowerCase();
        updateCurrentRow();
    }
}

function handleBackspace() {
    if (gameOver) return;
    if (currentGuess.length > 0) {
        currentGuess = currentGuess.slice(0, -1);
        updateCurrentRow();
    }
}

function handleEnter() {
    if (gameOver) return;
    if (currentGuess.length !== 5) {
        showMessage('Word must be 5 letters long');
        return;
    }

    if (!WORDS_DATA.hasOwnProperty(currentGuess.toLowerCase())) {
        showMessage('Word not in word list');
        return;
    }

    checkGuess();
}

function updateCurrentRow() {
    if (currentAttempt >= grid.length) {
        console.error('Current attempt exceeds grid rows.');
        return;
    }
    const currentRow = grid[currentAttempt];
    for (let i = 0; i < 5; i++) {
        const letter = i < currentGuess.length ? currentGuess[i].toUpperCase() : '';
        currentRow[i].element.textContent = letter;
        currentRow[i].letter = i < currentGuess.length ? currentGuess[i] : '';
    }
}

function checkGuess() {
    const currentRow = grid[currentAttempt];
    const letterCount = {};
    
    // Count letters in the target word
    for (let letter of currentWord) {
        letterCount[letter] = (letterCount[letter] || 0) + 1;
    }

    const results = [];

    // First pass: mark correct positions
    for (let i = 0; i < 5; i++) {
        if (currentGuess[i] === currentWord[i]) {
            results[i] = 'correct';
            letterCount[currentGuess[i]]--;
        } else {
            results[i] = null;
        }
    }

    // Second pass: mark present letters
    for (let i = 0; i < 5; i++) {
        if (results[i] === null) {
            if (letterCount[currentGuess[i]] > 0) {
                results[i] = 'present';
                letterCount[currentGuess[i]]--;
            } else {
                results[i] = 'absent';
            }
        }
    }

    // Store guess in history
    guessHistory[currentAttempt] = currentGuess;

    // Update tooltip for this row
    updateRowTooltip(currentAttempt, currentGuess);

    // Update keyboard for ALL letters in the guess
    for (let i = 0; i < 5; i++) {
        updateKeyboard(currentGuess[i], results[i]);
    }

    // Apply results with animation
    currentRow.forEach((cell, i) => {
        setTimeout(() => {
            cell.element.classList.add('flip');
            setTimeout(() => {
                cell.element.classList.add(results[i]);
                cell.state = results[i];
                // CRITICAL: Ensure the letter stays visible after animation
                cell.element.textContent = currentGuess[i].toUpperCase();
                cell.letter = currentGuess[i];
            }, 300);
        }, i * 100);
    });

    // Check win/lose condition
    setTimeout(() => {
        if (currentGuess === currentWord) {
            gameOver = true;
            // Add winning animation
            document.getElementById(`row-${currentAttempt}`).classList.add('winning');
            showMessage('Congratulations! You won! 🎉');
            setTimeout(() => showWordInfo(), 2000);
        } else {
            currentAttempt++;
            if (currentAttempt >= 6) {
                gameOver = true;
                showMessage('Game Over! Better luck next time!');
                setTimeout(() => showWordInfo(), 2000);
            } else {
                updateAttemptDisplay();
            }
        }
        currentGuess = '';
    }, 600);
}

function updateKeyboard(letter, state) {
    const key = Array.from(document.querySelectorAll('.key')).find(k => 
        k.textContent.toLowerCase() === letter
    );
    
    if (key) {
        const currentState = keyboardStates[letter] || '';
        
        // State priority: correct > present > absent
        if (state === 'correct') {
            // Always upgrade to correct (highest priority)
            keyboardStates[letter] = 'correct';
            key.className = key.classList.contains('wide') ? 'key wide correct' : 'key correct';
        } else if (state === 'present') {
            // Only upgrade to present if not already correct
            if (currentState !== 'correct') {
                keyboardStates[letter] = 'present';
                key.className = key.classList.contains('wide') ? 'key wide present' : 'key present';
            }
        } else if (state === 'absent') {
            // Only set absent if no previous state exists
            if (!currentState) {
                keyboardStates[letter] = 'absent';
                key.className = key.classList.contains('wide') ? 'key wide absent' : 'key absent';
            }
        }
    }
}

// Tooltip functions
function showTooltip(event, rowIndex) {
    if (rowIndex >= guessHistory.length || !guessHistory[rowIndex]) return;
    
    const guessedWord = guessHistory[rowIndex];
    const wordData = WORDS_DATA[guessedWord];
    
    if (!wordData || !wordData.ar_word) return;
    
    const tooltip = document.getElementById('tooltip');
    tooltip.textContent = wordData.ar_word;
    
    // Position tooltip above the row center
    const rowElement = document.getElementById(`row-${rowIndex}`);
    const rect = rowElement.getBoundingClientRect();
    tooltip.style.left = `${rect.left + rect.width / 2}px`;
    tooltip.style.top = `${rect.top - 45}px`;
    tooltip.style.transform = 'translateX(-50%)';
    
    tooltip.classList.add('show');
}

function hideTooltip() {
    const tooltip = document.getElementById('tooltip');
    tooltip.classList.remove('show');
}

function updateRowTooltip(rowIndex, guessedWord) {
    const wordData = WORDS_DATA[guessedWord];
    const tooltipElement = document.getElementById(`tooltip-${rowIndex}`);
    
    if (tooltipElement && wordData && wordData.ar_word) {
        tooltipElement.textContent = wordData.ar_word;
    }
}

function toggleMobileTooltip(rowIndex) {
    if (rowIndex >= guessHistory.length || !guessHistory[rowIndex]) return;
    
    // Hide all other tooltips
    hideAllMobileTooltips();
    
    // Show this row's tooltip
    const rowElement = document.getElementById(`row-${rowIndex}`);
    rowElement.classList.add('show-tooltip');
    
    // Auto-hide after 3 seconds
    setTimeout(() => {
        rowElement.classList.remove('show-tooltip');
    }, 3000);
}

function hideAllMobileTooltips() {
    document.querySelectorAll('.row').forEach(row => {
        row.classList.remove('show-tooltip');
    });
}

function showMessage(text) {
    const messageEl = document.getElementById('message');
    if (messageEl) {
        messageEl.textContent = text;
        messageEl.classList.add('show');
        setTimeout(() => messageEl.classList.remove('show'), 2000);
    } else {
        console.error('Message element not found.');
    }
}

function showWordInfo() {
    const wordData = WORDS_DATA[currentWord];
    document.getElementById('word-display').textContent = currentWord.toUpperCase();
    document.getElementById('word-arabic').textContent = wordData.ar_word || 'غير متوفر';
    document.getElementById('definition-en').textContent = wordData.en || 'No definition available';
    document.getElementById('definition-ar').textContent = wordData.ar_def || 'غير متوفر تعريف';
    document.getElementById('frequency').textContent = `Frequency Score: ${wordData.signals ? wordData.signals.freq : 'N/A'}`;
    document.getElementById('word-info-panel').classList.add('show');
}

function closeWordInfo() {
    document.getElementById('word-info-panel').classList.remove('show');
}

function setupKeyboardListener() {
    document.addEventListener('keydown', (e) => {
        if (gameOver) return;

        if (e.key >= 'a' && e.key <= 'z') {
            handleKey(e.key);
        } else if (e.key === 'Backspace') {
            handleBackspace();
        } else if (e.key === 'Enter') {
            handleEnter();
        }
    });
}

// Load words data and initialize the game
fetch('./words.json')
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to load words.json');
        }
        return response.json();
    })
    .then(data => {
        WORDS_DATA = data;
        console.log('WORDS_DATA loaded:', WORDS_DATA);
        initGame();
    })
    .catch(error => {
        console.error('Error loading words:', error);
        showMessage('Error loading word data. Please check your connection or try again.');
    });