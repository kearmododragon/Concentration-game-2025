const difficultySelect = document.getElementById("difficulty-select");
const startBtn = document.getElementById("start-btn");
const playAgain = document.getElementById("play-again");
const gameBoard = document.getElementById("game-board");
const livesTextEl = document.getElementById("lives");
const gameOverText = document.getElementById("gameOverText");
const scoreText = document.getElementById("scoreText");
const timerEl = document.getElementById("timer");
const specialPairCard = document.getElementById("specialPairCard")

const home = document.getElementById("homePage");
const game = document.getElementById("gamePage");
const end = document.getElementById("endGame");

const gameState = {
    difficulty: "",
    gridSize: 0,
    lives: 0,
    timeElapsed: 0,
    timerId: null,
    matchedPairs: 0,
    totalPairs: 0,
    endlessMode: false,
    endlessMatchedPairs: 0,
    score: 0,
    firstGuess: true,
    specialPair: null,
    timerPaused: false,
}
let firstCard = null;
let secondCard = null;
let lockBoard = false;



startBtn.addEventListener("click", startGame);
playAgain.addEventListener("click", restart)

function startGame() {
    gameState.endlessMode = false;
    gameState.endlessMatchedPairs = 0
    gameState.firstGuess = true;
    gameState.difficulty = difficultySelect.value
    gameState.timeElapsed = 0;
    if (gameState.difficulty === "easy") gameState.gridSize = 2;
    if (gameState.difficulty === "medium") gameState.gridSize = 4;
    if (gameState.difficulty === "hard") gameState.gridSize = 6;
    if (gameState.difficulty === "endless") {
        gameState.endlessMode = true;
        gameState.gridSize = 2;
        gameState.lives = 20;
        if (!gameState.specialPair) {
            const pairs = [...new Set(createShuffledDeck(4))];
            gameState.specialPair = pairs[Math.floor(Math.random() * pairs.length)]
        }
    } else {
        gameState.lives = gameState.gridSize * 5;
    }
    const numCards = gameState.gridSize * gameState.gridSize;

    gameState.totalPairs = numCards / 2;
    gameState.matchedPairs = 0;

    gameBoard.style.gridTemplateColumns = `repeat(${gameState.gridSize}, 80px)`

    const deck = createShuffledDeck(numCards);

    createBoard(deck);
    setSpecialPairFromDeck(deck);
    showGamePage()
    startTimer()
    updateLivesDisplay()
    console.log(gameState.lives)
};
function restart() {
    console.log("play again")
    clearInterval(gameState.timerId);
    firstCard = null;
    secondCard = null;
    lockBoard = false;
    gameState.matchedPairs = 0;
    gameState.totalPairs = 0;
    gameState.lives = 0;
    gameState.timeElapsed = 0;
    gameState.score = 0;
    gameState.endlessMode = false;
    gameState.gridSize = 0;
    gameState.endlessMatchedPairs = 0;
    gameBoard.innerHTML = "";
    showHomePage()
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
    const value1 = firstCard.dataset.value;
    const value2 = secondCard.dataset.value;

    const isMatch = value1 === value2;

    if (isMatch) {
        if (gameState.firstGuess) {
            gameState.lives += 5;
            updateLivesDisplay();
        }
        gameState.firstGuess = false;
        if (value1 === gameState.specialPair) {
            triggerTimeFreeze();
        }
        disableCards();
    } else {
        gameState.firstGuess = false;
        unflipCards();
    }
}
function disableCards() {
    firstCard.removeEventListener("click", handleCardClick);
    secondCard.removeEventListener("click", handleCardClick);

    gameState.matchedPairs++;
    if (gameState.endlessMode) {
        gameState.endlessMatchedPairs++;
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
        gameState.lives--;
        updateLivesDisplay();
        checkLose();
    }, 1000);
}
function resetBoard() {
    [firstCard, secondCard] = [null, null];
    lockBoard = false;
}
function checkWin() {
    console.log("matched:", gameState.matchedPairs, "total", gameState.totalPairs)
    if (gameState.matchedPairs === gameState.totalPairs) {
        if (gameState.endlessMode) {
            console.log("endless level completed");
            setTimeout(() => {
                gameState.firstGuess = true;
                gameState.gridSize += 2;
                gameState.lives += 20;
                gameState.matchedPairs = 0;
                gameState.totalPairs = (gameState.gridSize * gameState.gridSize) / 2;
                gameBoard.style.gridTemplateColumns = `repeat(${gameState.gridSize}, 80px)`;
                const deck = createShuffledDeck(gameState.gridSize * gameState.gridSize);
                createBoard(deck);
                setSpecialPairFromDeck(deck);
                resetBoard();
                updateLivesDisplay();
            }, 1000)
        } else {
            setTimeout(() => {
                showEndPage()
                gameState.score = (gameState.lives * 100) - (gameState.timeElapsed * 2)
                gameOverText.textContent = "Congratulations, you win!"
                scoreText.textContent = `You had ${gameState.lives} life/lives left! Well done! It only took you ${gameState.timeElapsed} seconds to do it, too! Final Score: ${gameState.score}`
                console.log("win");
            }, 300)
            if (!gameState.endlessMode) {
                clearInterval(gameState.timerId);
            }
        }
    }
}
function checkLose() {
    if (gameState.lives === 0) {
        if (gameState.endlessMode) {
            lockBoard = true;
            showEndPage()

            gameOverText.textContent = "GAME OVER! Endless mode complete."
            gameState.score = gameState.endlessMatchedPairs * 5

            scoreText.textContent = `You attempted endless mode. It took you ${gameState.timeElapsed} seconds and your Final Score is: ${gameState.score}`
            clearInterval(gameState.timerId);
        } else {
            lockBoard = true;
            showEndPage()
            gameOverText.textContent = "GAME OVER! YOU LOSE."
            gameState.score = (gameState.lives * 100) - (gameState.timeElapsed * 2) * gameState.gridSize

            scoreText.textContent = `You had one job. You failed. It took you ${gameState.timeElapsed} seconds to achieve nothing. Final Score: ${gameState.score}`
            clearInterval(gameState.timerId);
        }
    }

}
function updateLivesDisplay() {
    livesTextEl.textContent = `Lives left: ${gameState.lives}`;
}
function startTimer() {
    updateTimerDisplay();

    gameState.timerId = setInterval(() => {
        gameState.timeElapsed++;
        updateTimerDisplay();
    }, 1000)
}
function updateTimerDisplay() {
    timerEl.textContent = `Time: ${gameState.timeElapsed}s`;
}
function showHomePage() {
    home.classList.remove("hidden")
    game.classList.add("hidden")
    end.classList.add("hidden")
}
function showGamePage() {
    home.classList.add("hidden")
    game.classList.remove("hidden")
    end.classList.add("hidden")
}
function showEndPage() {
    home.classList.add("hidden")
    game.classList.add("hidden")
    end.classList.remove("hidden")
}
function triggerTimeFreeze() {
    if (gameState.timerPaused) return;

    gameState.timerPaused = true;
    clearInterval(gameState.timerId);

    setTimeout(() => {
        gameState.timerPaused = false;
        startTimer();
    }, 5000)
}
function setSpecialPairFromDeck(deck) {
    const pairs = [...new Set(deck)];
    gameState.specialPair = pairs[Math.floor(Math.random() * pairs.length)];

    specialPairCard.classList.add("flipped");
    specialPairCard.textContent = gameState.specialPair;
}