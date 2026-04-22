const difficulty = ["easy", "medium", "hard"]

const difficultySelect = document.getElementById("difficulty-select");
const startBtn = document.getElementById("start-btn");
const playAgain = document.getElementById("play-again")
const gameBoard = document.getElementById("game-board");


startBtn.addEventListener("click", startGame);
playAgain.addEventListener("click", restart)

function startGame() {
    const difficulty = difficultySelect.value;

    let gridSize;
    if (difficulty === "easy") gridSize = 2;
    if (difficulty === "medium") gridSize = 4;
    if (difficulty === "hard") gridSize = 6;

    const numCards = gridSize*gridSize;

    gameBoard.style.gridTemplateColumns = `repeat(${gridSize}, 80px)`

    const deck = createShuffledDeck(numCards);

    createBoard(deck);

    console.log(deck);

};
function restart(){
    console.log("play again")
};
function createBoard(deck) {
    gameBoard.innerHTML = "";

    deck.forEach(value => { 
        const card = document.createElement("div");
        card.classList.add("card")

        card.dataset.value = value
        card.textContent = "?";

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