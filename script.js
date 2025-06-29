const guesses = document.getElementById('guesses');
const maxGuesses = document.getElementById('max-guesses');
const difficultyButtons = document.querySelectorAll('.difficulty-item button');
let score = 0;
let win = false;
let question = {};
let correctCountry = '';
let lastQuestionIndex = -1;
let difficulty = 'easy';
let guessCount = 4;
let maxGuessNum = 4;

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
            articleLink: item.articleLink,
            img: item.img,
            alt: item.alt
        }));
    })
    .catch(error => {
        console.error('Error loading questions:', error);
    });

difficultyButtons.forEach(button => {
    button.addEventListener('click', function() {
        // Get the difficulty from the parent li element
        difficulty = this.parentElement.getAttribute('data-difficulty');
        console.log('Selected difficulty:', difficulty);
        
        // Hide main menu and show game
        document.getElementById('main-menu').classList.add('hidden');
        document.getElementById('game').classList.remove('hidden');
        gameRestart(win);
    });
});

function setDifficulty(difficulty) {
    console.log('Setting difficulty:', difficulty);

    if (difficulty == 'easy') {
        guessCount = 4;
        maxGuessNum = 4;
    } else if (difficulty == 'medium') {
        guessCount = 3;
        maxGuessNum = 3;
    } else if (difficulty == 'hard') {
        guessCount = 2;
        maxGuessNum = 2;
    }

    maxGuesses.textContent = maxGuessNum;
    guesses.textContent = guessCount;
}

function chooseQuestion(questions) {
    console.log('chooseQuestion called with questions array length:', questions.length);
    console.log('Questions array:', questions);
    
    if (questions.length === 0) {
        console.error('Questions array is empty!');
        return;
    }
    
    let randomIndex;
    
    // If there's only one question, use it
    if (questions.length === 1) {
        randomIndex = 0;
    } else {
        // Prevent the same index from being chosen twice in a row
        do {
            randomIndex = Math.floor(Math.random() * questions.length);
        } while (randomIndex === lastQuestionIndex);
    }
    
    lastQuestionIndex = randomIndex;
    question = questions[randomIndex];
    document.getElementById('question-text').textContent = question.question;
    document.getElementById('clue1-text').textContent = question.clue1;
    document.getElementById('clue2-text').textContent = question.clue2;
    document.getElementById('clue3-text').textContent = question.clue3;
    document.getElementById('article-link').href = question.articleLink;
    document.getElementById('img-link').src = question.img;
    document.getElementById('img-link').alt = question.alt;
    correctCountry = question.answer;
    console.log('Index chosen:', randomIndex);
}

function gameRestart(winBoolean) {
    console.log('gameRestart called with winBoolean:', winBoolean);
    setDifficulty(difficulty);

    for (let i = 1; i < 4; i++) {
        addHidden('clue' + i + '-text');
        document.getElementById('clue' + i + '-icon').textContent = '🔒';
    }

    const disabledLink = document.getElementsByClassName('disabled-link')[0];
    if (disabledLink) {
        disabledLink.classList.remove('disabled-link');
    }

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
    let clueNumber = maxGuessNum - guessCount;

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