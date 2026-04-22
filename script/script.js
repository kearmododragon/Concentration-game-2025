const difficulty = ["easy", "medium", "hard"]

const difficultySelect = document.getElementById("difficulty-select");
const startBtn = document.getElementById("start-btn");
const playAgain = document.getElementById("play-again")
const gameBoard = document.getElementById("game-board");

const home = document.getElementById("homePage")
const game = document.getElementById("gamePage")
const end = document.getElementById("endGame")


let firstCard = null;
let secondCard = null;
let lockBoard = false;
let totalPairs = 0;
let matchedPairs = 0;

startBtn.addEventListener("click", startGame);
playAgain.addEventListener("click", restart)

function startGame() {
    const difficulty = difficultySelect.value;

    let gridSize;
    if (difficulty === "easy") gridSize = 2;
    if (difficulty === "medium") gridSize = 4;
    if (difficulty === "hard") gridSize = 6;

    const numCards = gridSize*gridSize;

    totalPairs = numCards / 2;
    matchedPairs = 0;

    gameBoard.style.gridTemplateColumns = `repeat(${gridSize}, 80px)`

    const deck = createShuffledDeck(numCards);

    createBoard(deck);

    home.classList.add("hidden")
    game.classList.remove("hidden")
    end.classList.add("hidden")
};
function restart(){
    console.log("play again")

    firstCard = null;
    secondCard = null;
    lockBoard = false;
    matchedPairs = 0;
    totalPairs = 0;
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
        card.textContent = "?";

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
function shuffle(array){
    for(let i = array.length - 1; i > 0; i--) {
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
    card.textContent = card.dataset.value;
}
function checkMatch() {
    const isMatch = firstCard.dataset.value === secondCard.dataset.value;

    if(isMatch) {
        disableCards();
    } else {
        unflipCards();
    }
}
function disableCards() {
    firstCard.removeEventListener("click", handleCardClick);
    secondCard.removeEventListener("click", handleCardClick);

    matchedPairs++;

    checkWin();

    resetBoard();
}
function unflipCards() {
    lockBoard = true;

    setTimeout(() => { 
        firstCard.textContent = "?";
        secondCard.textContent = "?";

        resetBoard();
    }, 1000);
}
function resetBoard(){
    [firstCard, secondCard] = [null, null];
    lockBoard = false;
}
function checkWin(){
    if (matchedPairs === totalPairs) {
        setTimeout(() => {
                home.classList.add("hidden")
                game.classList.add("hidden")
                end.classList.remove("hidden")
        }, 300)
    }
}