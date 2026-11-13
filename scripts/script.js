let list = [];
let PuzzleEntry = [];
let guessedGroups = [];
let gameWords = [];
let gameGrid = document.querySelector(`.game-grid`);
let gameGridCategories = document.querySelector(`.categories`);
let mistakes = document.querySelector(`.mistake-count`);
let mistakesRemaining = 4;
let messageBox = document.querySelector(`.message-box`);
let deselectButton = document.querySelector(`.deselectAll`);
let submitButton = document.querySelector(`.checkGuess`);
let deselectGrey = () => deselectButton.classList.toggle('grey', document.querySelectorAll(`.clicked`).length < 1);
let submitGrey = () => submitButton.classList.toggle('grey', document.querySelectorAll(`.clicked`).length < 4);

const helpDialog = document.querySelector('.help-dialog');
document.querySelector('.pop-up').addEventListener('click', () => helpDialog.showModal());
document.querySelector('.close-help').addEventListener('click', () => helpDialog.close());

async function loadGameWordMatches() {
    try {
        const response = await fetch('GameWordMatches.json');
        
        if (!response.ok) {
            console.log('File not found or network error');
            return;
        }

        list = await response.json();
        loadSinglePuzzleEntry();
    } catch (error) {
        console.error('An error occurred:', error);
    }
}

loadGameWordMatches();

function loadSinglePuzzleEntry(){
    PuzzleEntry = list[Math.floor(Math.random()*list.length)];
    gameWords = PuzzleEntry.words;

    gameGridCategories.replaceChildren();
    loadTiles();
    deselectGrey();
    submitGrey();
}

function deselectAll(){
    document.querySelectorAll(`.clicked`).forEach(tile =>{
        tile.classList.remove(`clicked`);
    });
    deselectGrey();
    submitGrey();
}

function loadGuessedCategories(group){

    let p = document.createElement(`p`);
    let br = document.createElement(`br`);
    p.classList.add(`word-tile`, `guessed-category`);
    p.style.backgroundColor = `${group.difficulty}`;
    p.appendChild(document.createTextNode(`${group.category}`));
    p.appendChild(br);
    p.appendChild(document.createTextNode(`${group.words}`));

    p.classList.add(`expand`);
    setTimeout(() => {
        p.classList.remove(`expand`);
    }, 2000);
    gameGridCategories.appendChild(p);
}

function shuffle(){
    let clicked = [...document.querySelectorAll('.clicked')]
    .map(element => element.textContent);
    gameGrid.replaceChildren();
    let copyWords = gameWords;
    while(copyWords.length > 0){
        let count = Math.floor(Math.random()*copyWords.length);
        let word = copyWords[count];
        copyWords = copyWords.toSpliced(count, 1);
        makeTile(word, clicked);
    }
    giveMessage(`Yup... that'll help`);
}

function makeTile(word, clicked){
    let p = document.createElement(`p`);
    p.classList.add('word-tile');
    p.classList.toggle('clicked', clicked.includes(word));
    p.textContent = word;
    p.addEventListener(`click`, () => {
        if(document.querySelectorAll(`.clicked`).length < 4 || p.classList.contains(`clicked`)){
            p.classList.toggle('clicked'); 

        }
        deselectGrey();
        submitGrey();
    });
    gameGrid.appendChild(p);

}

function loadTiles(){
    let clicked = [...document.querySelectorAll('.clicked')]
    .map(element => element.textContent);
    gameGrid.replaceChildren();
    gameWords.forEach(word => {
        makeTile(word, clicked);
    });
}

function giveMessage(message){
    messageBox.style.visibility = 'visible';
    messageBox.textContent = message;

    setTimeout(() => {
        messageBox.style.visibility = 'hidden';
    }, 4000);
}

function checkGuess(){

    let tiles = [...document.querySelectorAll('.clicked')]
    .map(element => element.textContent);


    if(tiles.length === 4){

        for(gr in PuzzleEntry.groups){
            let groups = PuzzleEntry.groups[gr];
            let matches = tiles.filter(tile => groups.words.includes(tile));
            if(matches.length === 4){
                guessedGroups.push(groups);
                gameWords = gameWords.filter(words => !matches.includes(words));
                loadTiles();
                deselectAll();
                loadGuessedCategories(groups);

                if(guessedGroups.length === 4){
                    giveMessage(`Great job`);
                }
                return;
            }
            else if(matches.length === 3){
                giveMessage(`One away...`);
            }

        }

        mistakesRemaining--;
        mistakes.textContent = `Mistakes Remaining: ${mistakesRemaining}`;

        tiles = document.querySelectorAll(`.word-tile`);
        tiles.forEach(tile => {
            tile.classList.add(`shake`);

            setTimeout(() => {
                tile.classList.remove(`shake`);
            }, 1000);
        });

    }

    if(mistakesRemaining === 0){
        deselectAll();
        giveMessage(`Better luck next time`);
        PuzzleEntry.groups.forEach((group, index) => {
            setTimeout(() => {
                if(!guessedGroups.includes(group)){
                    gameWords = gameWords.filter(words => !group.words.includes(words));
                    loadGuessedCategories(group);
                    loadTiles();
                }
            }, (index*1500) + 1500);
        });
    }

}
