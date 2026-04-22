const difficultySelect = document.getElementById("difficulty-select");
const startBtn = document.getElementById("start-btn");
const playAgain = document.getElementById("play-again");
const gameBoard = document.getElementById("game-board");
const livesTextEl = document.getElementById("lives");
const gameOverText = document.getElementById("gameOverText");
const scoreText = document.getElementById("scoreText");
const timerEl = document.getElementById("timer");

const home = document.getElementById("homePage");
const game = document.getElementById("gamePage");
const end = document.getElementById("endGame");


let firstCard = null;
let secondCard = null;
let lockBoard = false;
let totalPairs = 0;
let matchedPairs = 0;
let lives = 0;
let timeElapsed = 0;
let timerId = null;
let score = 0;
let currentLevel = 1;
let difficulty = "";
let gridSize = 0;
let endlessMatchedPairs = 0;

startBtn.addEventListener("click", startGame);
playAgain.addEventListener("click", restart)

function startGame() {
    difficulty = difficultySelect.value

    if (difficulty === "easy") gridSize = 2;
    if (difficulty === "medium") gridSize = 4;
    if (difficulty === "hard") gridSize = 6;
    if (difficulty === "endless"){
        endlessMode = true;
        gridSize = 2;
        lives = 20;
    } else {
        lives = gridSize*5;
    }
    difficulty=difficultySelect.value
    const numCards = gridSize * gridSize;

    totalPairs = numCards / 2;
    matchedPairs = 0;

    gameBoard.style.gridTemplateColumns = `repeat(${gridSize}, 80px)`

    const deck = createShuffledDeck(numCards);

    createBoard(deck);

    home.classList.add("hidden")
    game.classList.remove("hidden")
    end.classList.add("hidden")
    startTimer()
    updateLivesDisplay()
    console.log(lives)
};
function restart() {
    console.log("play again")
    clearInterval(timerId);
    firstCard = null;
    secondCard = null;
    lockBoard = false;
    matchedPairs = 0;
    totalPairs = 0;
    lives = 0;
    timeElapsed = 0;
    score = 0;
    endlessMode = false;
    currentLevel = 1;
    gridSize = 0;
    gameBoard.innerHTML = "";
    home.classList.remove("hidden")
    game.classList.add("hidden")
    end.classList.add("hidden")
};
function createBoard(deck) {
    gameBoard.innerHTML = "";

    deck.forEach(value => {
        const card = document.createElement("div");
        card.classList.add("card")

        card.dataset.value = value
        card.textContent = "";

        card.addEventListener("click", handleCardClick);

        gameBoard.appendChild(card)
    });
};
function generateDeck(numCards) {
    const numPairs = numCards / 2;

    const values = [];

    for (let i = 0; i < numPairs; i++) {
        const letter = String.fromCharCode(65 + i);
        values.push(letter, letter);
    }
    return values
};
function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]]
    }
    return array
}
function createShuffledDeck(numCards) {
    const deck = generateDeck(numCards);
    return shuffle(deck);
}
function handleCardClick(e) {
    if (lockBoard) return;

    const card = e.target;

    if (card === firstCard) return;

    revealCard(card);

    if (!firstCard) {
        firstCard = card;
        return
    }

    secondCard = card;

    checkMatch()
}
function revealCard(card) {
    card.classList.add("flipped");
    card.textContent = card.dataset.value;
}
function checkMatch() {
    const isMatch = firstCard.dataset.value === secondCard.dataset.value;

    if (isMatch) {
        disableCards();
    } else {
        unflipCards();
    }
    updateLivesDisplay()
}
function disableCards() {
    firstCard.removeEventListener("click", handleCardClick);
    secondCard.removeEventListener("click", handleCardClick);

    matchedPairs++;
    if (difficulty === "endless") {
        endlessMatchedPairs++;
    }
    checkWin();

    resetBoard();
}
function unflipCards() {
    lockBoard = true;


    setTimeout(() => {
        firstCard.classList.remove("flipped")
        secondCard.classList.remove("flipped")
        firstCard.textContent = "";
        secondCard.textContent = "";

        resetBoard();
        lives--
        updateLivesDisplay();
        checkLose();
    }, 1000);
}
function resetBoard() {
    [firstCard, secondCard] = [null, null];
    lockBoard = false;
}
function checkWin() {
    console.log("matched:", matchedPairs, "total", totalPairs)
    if (matchedPairs === totalPairs) {
        if (difficulty === "endless") {
            console.log("endless level completed");
            setTimeout(() => {
                gridSize+= 2;
                lives += 20;
                matchedPairs = 0;
                totalPairs = (gridSize * gridSize) /2;
                gameBoard.style.gridTemplateColumns = `repeat(${gridSize}, 80px)`;
                const deck = createShuffledDeck(gridSize * gridSize);
                createBoard(deck);
                resetBoard();
                updateLivesDisplay();
            }, 1000)
        }else {
        setTimeout(() => {
            home.classList.add("hidden")
            game.classList.add("hidden")
            end.classList.remove("hidden")
            score = (lives * 100) - (timeElapsed * 2)
            gameOverText.textContent = "Congratulations, you win!"
            scoreText.textContent = `You had ${lives} life/lives left! Well done! It only took you ${timeElapsed} seconds to do it, too! Final Score: ${score}`
            console.log("win");
        }, 300)
        if(!endlessMode){
        clearInterval(timerId);
        }}}
}
function checkLose() {
    if (lives === 0) {
        if (difficulty === "endless") {
                   lockBoard = true;
        home.classList.add("hidden")
        game.classList.add("hidden")
        end.classList.remove("hidden")
        console.log("lose")
        gameOverText.textContent = "GAME OVER! Endless mode complete."
        score = endlessMatchedPairs * 5

        scoreText.textContent = `You attempted endless mode. It took you ${timeElapsed} seconds and your Final Score is: ${score}`
        clearInterval(timerId); 
        } else {
        lockBoard = true;
        home.classList.add("hidden")
        game.classList.add("hidden")
        end.classList.remove("hidden")
        console.log("lose")
        gameOverText.textContent = "GAME OVER! YOU LOSE."
        score = (lives * 100) - (timeElapsed * 2) * gridSize

        scoreText.textContent = `You had one job. You failed. It took you ${timeElapsed} seconds to achieve nothing. Final Score: ${score}`
        clearInterval(timerId);
    }}

}
function updateLivesDisplay() {
    livesTextEl.textContent = `Lives left: ${lives}`;
}
function startTimer(){
    timeElapsed = 0;
    updateTimerDisplay();

    timerId = setInterval(() => {
        timeElapsed++;
        updateTimerDisplay();
    }, 1000)
}
function updateTimerDisplay() {
    timerEl.textContent = `Time: ${timeElapsed}s`;
}