const guesses = document.getElementById('guesses');
const maxGuesses = document.getElementById('max-guesses');
const difficultyButtons = document.querySelectorAll('.difficulty-item button');
const imgLinks = document.querySelectorAll('.img-link');

const gameStartAudio = document.getElementById('game-start-audio');
const gameOverAudio = document.getElementById('game-over-audio');
const winAudio = document.getElementById('win-audio');
const failAudio = document.getElementById('fail-audio');

let score = 0;
let scoreMult = 1;
let scoreBase = 500;

let win = false;
let question = {};
let correctCountry = '';
let lastQuestionIndex = -1;
let difficulty = 'easy';
let guessCount = 4;
let maxGuessNum = 4;
let questionCount = 0;
let questionCorrect = false;

let gameEnabled = false;

// Import questions data
let questions = [];

// Disable difficulty buttons initially
difficultyButtons.forEach(button => {
    button.disabled = true;
});

async function loadQuestion() {
    const response = await fetch('./questions.json');
    if (!response.ok) {
        throw new Error('Failed to load questions');
    }
    return await response.json();
}

async function transformQuestions() {
    const data = await loadQuestion();
    try {
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
        console.log('Questions loaded successfully:', questions);
    } catch (error) {
        console.error('Error loading or transforming questions:', error);
    }
}

// Do not start the game until questions are loaded
document.addEventListener('DOMContentLoaded', async () => {
    try {
        await transformQuestions();
        enableGame();
    } catch (error) {
        console.error('Error during initialization:', error);
        alert('Failed to load questions. Please try again later.');
    }
});

function enableGame() {
    if (gameEnabled) return;
    console.log('Enabling game, difficulty buttons are now clickable');
    difficultyButtons.forEach(button => {
        button.disabled = false;
        button.addEventListener('click', function() {
            // Get the difficulty from the parent li element
            difficulty = this.parentElement.getAttribute('data-difficulty');
            console.log('Selected difficulty:', difficulty);

            // Hide main menu and show game
            document.getElementById('main-menu').classList.add('hidden');
            document.getElementById('game').classList.remove('hidden');
            gameEnabled = true;
            restartQuestion();
        });
    });
}

function setDifficulty(difficulty) {
    console.log('Setting difficulty:', difficulty);

    if (difficulty == 'easy') {
        guessCount = 4;
        maxGuessNum = 4;
        scoreMult = 1;
    } else if (difficulty == 'medium') {
        guessCount = 3;
        maxGuessNum = 3;
        scoreMult = 1.5;
    } else if (difficulty == 'hard') {
        guessCount = 2;
        maxGuessNum = 2;
        scoreMult = 2;
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
    document.getElementById('article-link').textContent = question.article;

    imgLinks.forEach(link => {
        link.src = question.img;
        link.alt = question.alt;
    });

    correctCountry = question.answer;
    console.log('Index chosen:', randomIndex);
}

function restartQuestion() {
    setDifficulty(difficulty);

    for (let i = 1; i <= 3; i++) {
        removeHidden('clue' + i);
        addHidden('clue' + i + '-text');
        document.getElementById('clue' + i + '-icon').textContent = '🔒';
    }

    // Then hide clues based on difficulty
    if (difficulty == 'hard') {
        addHidden('clue2');
        addHidden('clue3');
    } else if (difficulty == 'medium') {
        addHidden('clue3');
    }
    // Easy mode: all clues visible (no additional hiding needed)

    const disabledLink = document.getElementsByClassName('disabled-link')[0];
    if (disabledLink) {
        disabledLink.classList.remove('disabled-link');
    }

    document.getElementById('score').textContent = score;
    scoreBase = 500;

    chooseQuestion(questions);

    win = false;

    if (questionCount == 0) {
        gameStartAudio.play();
    }
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
        winAudio.play();
        win = true;
        questionCount++;
        questionCorrect = true;
        calculateScore(win);
        endQuestionScreen(questionCorrect);
    } else if (guessCount > 0) {
        guesses.textContent = guessCount;
        unlockClue(guessCount);
        scoreBase -= 100;
        failAudio.play();
        alert('Incorrect! Try again.');
    }
    else {
        gameOverAudio.play();
        questionCount++;
        questionCorrect = false;
        calculateScore(win);
        endQuestionScreen(questionCorrect);
    }
});

function calculateScore(winBoolean) {
    if (winBoolean == true) {
        score += (scoreBase * scoreMult);
    }
}

function checkQuestionCount(questionCount) {
    console.log('checkQuestionCount called');
    if (questionCount == 3 ) {
        console.log('End of game reached');
        endGameScreen();
    }
    else {
        console.log('Game continues, question count:', questionCount);
        document.getElementById('game').classList.remove('hidden');
        restartQuestion();
    }
}

function endQuestionScreen(questionCorrect) {
    console.log('endQuestionScreen called');
    document.getElementById('game').classList.add('hidden');
    document.getElementById('question-end').classList.remove('hidden');
    document.getElementById('current-score').textContent = score;
    if (questionCorrect == false) {
        document.getElementById('question-end-text').textContent = 'Incorrect! The correct answer was ' + correctCountry;
    }
    else {
        document.getElementById('question-end-text').textContent = 'Correct! Well done!';
    }
}

function endGameScreen() {
    console.log('endGameScreen called');
    document.getElementById('game').classList.add('hidden');
    document.getElementById('game-over').classList.remove('hidden');
    document.getElementById('final-score').textContent = score;

    // Determine the title based on the score
    let title = chooseTitle(score);
    let titleDesc = chooseTitleDesc(score);
    
    document.getElementById('score-title').textContent = title;
    document.getElementById('score-description').textContent = titleDesc;
}

function chooseTitle(score) {
    if (score >= 3000) {
        title = 'Wise Wellmaster';
    } else if (score >= 2000) {
        title = 'Spring Seeker';
    } else if (score >= 1000) {
        title = 'Thirsty for Knowledge';
    } else if (score >= 500) {
        title = 'Drip Discoverer';
    } else {
        title = 'Well Intentioned';
    }
    return title;
}

function chooseTitleDesc(score) {
    if (score >= 3000) {
        titleDesc = 'You\'ve mapped the world and mastered the mission. Your knowledge flows deep, and your insight sparks real change.';
    } else if (score >= 2000) {
        titleDesc = 'You\'re closing in on the source. Your answers show purpose, and your awareness is making ripples.';
    } else if (score >= 1000) {
        titleDesc = 'Your curiosity is flowing strong. Every question brings you closer to understanding the global water crisis.';
    } else if (score >= 500) {
        titleDesc = 'You\'re just beginning to connect the dots. The facts may trickle in slowly, but you\'re heading in the right direction.';
    } else {
        titleDesc = 'Every journey starts with a single drop. You may be guessing now, but your heart\'s in the right place.';
    }
    return titleDesc;
}

function restartGame() {
    console.log('restartGame called');
    score = 0;
    win = false;
    lastQuestionIndex = -1;
    guessCount = maxGuessNum;
    questionCount = 0;
    
    document.getElementById('game-over').classList.add('hidden');
    document.getElementById('main-menu').classList.remove('hidden');
}

document.getElementById('next-question').addEventListener('click', function() {
    document.getElementById('question-end').classList.add('hidden');
    checkQuestionCount(questionCount);
});


document.getElementById('restart-game').addEventListener('click', function() {
    restartGame();
}
);