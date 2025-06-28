const guesses = document.getElementById('guesses');
const countryGuess = document.getElementById('country-guess');
let guessCount = 4;
let score = 0;
let win = false;
let question = {};
let correctCountry = '';

// Import questions data
let questions = [];

// Fetch and load questions from JSON file
fetch('./questions.json')
    .then(response => response.json())
    .then(data => {
        questions = data.map(item => ({
            question: item.question,
            answer: item.answer,
            clue1: item.clue1,
            clue2: item.clue2,
            clue3: item.clue3,
            article: item.article,
            img: item.img
        }));

        gameRestart(win);
    })
    .catch(error => {
        console.error('Error loading questions:', error);
    });

function chooseQuestion(questions) {
    const randomIndex = Math.floor(Math.random() * questions.length);
    question = questions[randomIndex];
    document.getElementById('question-text').textContent = question.question;
    document.getElementById('clue1-text').textContent = question.clue1;
    document.getElementById('clue2-text').textContent = question.clue2;
    document.getElementById('clue3-text').textContent = question.clue3;
    document.getElementById('img-link').src = question.img;
    correctCountry = question.answer;
}

function gameRestart(winBoolean) {
    guessCount = 4;
    guesses.textContent = guessCount;

    for (let i = 1; i < 4; i++) {
        addHidden('clue' + i + '-text');
        document.getElementById('clue' + i + '-icon').textContent = '🔒';
    }

    document.getElementsByClassName('overlay')[0].classList.add('hidden');
    document.getElementsByClassName('disabled-link')[0].classList.remove('disabled-link');

    if (winBoolean == true) {
        score += 500;
        document.getElementById('score').textContent = score;
    }

    chooseQuestion(questions);

    win = false;
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

    guessCount--;

    if (country == correctCountry) {
        confetti();
        alert('Correct! Game restarting...');
        win = true;
        gameRestart(win);
    } else if (guessCount > 0) {
        guesses.textContent = guessCount;
        unlockClue(guessCount);
        alert('Incorrect! Try again.');
    }
    else {
        alert('Game Over! The correct answer was ' + correctCountry);
        gameRestart(win);
    }
});