const guesses = document.getElementById('guesses');
const countryGuess = document.getElementById('country-guess');
let guessCount = 4;
let score = 0;

function gameRestart(win) {
    guessCount = 4;
    guesses.textContent = guessCount;

    for (let i = 1; i < 4; i++) {
        addHidden('clue' + i + '-text');
        document.getElementById('clue' + i + '-icon').textContent = '🔒';
    }

    if (win == true) {
        score += 500;
        document.getElementById('score').textContent = score;
    }
}

function addHidden(elementId) {
    document.getElementById(elementId).classList.add('hidden');
}

function removeHidden(elementId) {
    document.getElementById(elementId).classList.remove('hidden');
}

function unlockClue(guessCount) {
    let maxGuesses = 4;
    let clueNumber = maxGuesses - guessCount;

    removeHidden('clue' + clueNumber + '-text');
    document.getElementById('clue' + clueNumber + '-icon').textContent = '⭐';
}

document.getElementById('country-select').addEventListener('submit', function(event) {
    event.preventDefault();
    const country = document.getElementById('country-guess').value;
    const correctCountry = '🇲🇱 Mali';
    let win = false;

    if (country == correctCountry) {
        confetti();
        alert('Correct! Game restarting...');
        win = true;
        gameRestart(win);
    } else if (guessCount > 0) {
        guessCount--;
        guesses.textContent = guessCount;
        unlockClue(guessCount);
        alert('Incorrect! Try again.');
    }
    else {
        alert('Game Over! The correct answer was ' + correctCountry);
        gameRestart(win);
    }
});