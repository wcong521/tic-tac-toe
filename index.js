const GameBoard = (function () {
    let board = [
        "&nbsp;", "&nbsp;", "&nbsp;",
        "&nbsp;", "&nbsp;", "&nbsp;",
        "&nbsp;", "&nbsp;", "&nbsp;"
    ];

    // @param Array of game-squares
    let render = (arr) => {
        // let new_arr = _convert_array(arr);
        for (let i = 0; i < arr.length; i++) {
                arr[i].innerHTML = board[i];
        }
    }
    let reset = () => {
        for (let i = 0; i < board.length; i++) {
            board[i] = "&nbsp;";
        }
    }
    return { board, render, reset };
})();



const DisplayController = (function () {

    let gameContainer = document.querySelector(".game-container");
    let gameSquares = Array.from(document.querySelectorAll(".game-square"));
    
    let playButton = document.querySelector(".play-button");
    let playerContainers = Array.from(document.querySelectorAll(".player-container"));

    let playerNameInputs = Array.from(document.querySelectorAll(".player-name-input"));
    let playerNames = [null, null];

    let gameEndMessage, playAgainButton, gameEnd;

    gameSquares.forEach(square => square.addEventListener("click", (e) => {
        GameController.play(e);
    }));

    function squareListener(e) {
        GameController.play(e);
    }

    playButton.addEventListener("click", (e) => {
        GameController.startGame(e);
        gameContainer.classList.remove("hidden");
    });

    let restartGame = () => {
        GameBoard.reset();
        GameBoard.render(gameSquares);
        document.body.removeChild(gameEnd);
    }

    let renderPlayerNames = () => {
        for (let i = 0; i < playerNames.length; i++) {
            playerNames[i] = document.createElement("div");

            if (playerNameInputs[i].value === "") {
                playerNameInputs[i].value = "Unnamed " + (i+1);
            }
            playerNames[i].innerHTML = playerNameInputs[i].value;
            GameController.createPlayer(playerNameInputs[i].value);

            playerNames[i].classList.add("player-name");

            playerContainers[i].removeChild(playerNameInputs[i]);
            playerContainers[i].appendChild(playerNames[i]);
        }
    };

    let renderTurnIndicator = (num) => {
        playerNames.forEach(player => player.classList.remove("active"));
        playerNames[num].classList.add("active");
    };

    let renderPlayerTurn = (e, symbol) => {
        let pos = e.target.getAttribute("data-pos");
        if (GameBoard.board[pos] !== "&nbsp;") {
            
        } 
        GameBoard.board[pos] = symbol;
        GameBoard.render(gameSquares);
    };

    let renderGameEnd = (message) => {

        gameEnd = document.createElement("div");
        gameEnd.classList.add("game-end");

        gameEndMessage = document.createElement("div");
        gameEndMessage.innerHTML = message;
        gameEndMessage.classList.add("game-end-message");

        playAgainButton = document.createElement("div");
        playAgainButton.innerHTML = "Play Again";
        playAgainButton.classList.add("play-again-button");

        playAgainButton.addEventListener("click", GameController.restartGame);

        gameEnd.appendChild(gameEndMessage);
        gameEnd.appendChild(playAgainButton);

        document.body.appendChild(gameEnd)
        
    };

    return {
        gameContainer,
        gameSquares,
        playButton,
        renderPlayerNames,
        renderTurnIndicator,
        renderPlayerTurn,
        renderGameEnd,
        restartGame
    }
})();

const GameController = (function () {
    
    let gameOver = true;
    let players = [];

    let restartGame = () => {
        DisplayController.restartGame();

        GameController.listenForTurn(0);
        gameOver = false;
    }
    
    let play = (e) => {
        if (gameOver) {
            return;
        }
        // do nothing if the square is already filled
        if (e.target.innerHTML !== "&nbsp;") {
            return;
        }

        for (let i = 0; i < players.length; i++) {
            if (players[i].myTurn) {
                DisplayController.renderPlayerTurn(e, players[i].symbol);
                if (checkIfWon(players[i]) === 1) {
                    endGame(players[i]);
                } else if (checkIfWon(players[i]) === -1) {
                    endGame();
                }
            }
        }
        for (let i = 0; i < players.length; i++) {
            if (!players[i].myTurn) {
                listenForTurn(i);
                break;
            }
        }
    };

    let endGame = (player) => {
        if (player === undefined) {
            DisplayController.renderGameEnd("Tied");
        } else {
            DisplayController.renderGameEnd(player.name + " won");
        }
        gameOver = true;
    }

    let checkIfWon = (player) => {

        // check col
        for (let col = 0; col <= 2; col++) {
            for (let row = col; row <= (col+6); row+=3) {
                if (GameBoard.board[row] !== player.symbol) {
                    break;
                }
                if (row === (col+6)) {
                    return 1;
                }
            }
        }

        // check row
        for (let row = 0; row <= 6; row+=3) {
            for (let col = row; col <= (row+2); col++) {
                if (GameBoard.board[col] !== player.symbol) {
                    break;
                }
                if (col === (row+2)) {
                    return 1;
                }
            }
        }

        for (let i = 0; i <= 8; i+=4) {
            if (GameBoard.board[i] !== player.symbol) {
                break;
            }
            if (i === 8) {
                return 1;
            }
        }

        for (let i = 2; i <= 6; i+=2) {
            if (GameBoard.board[i] !== player.symbol) {
                break;
            }
            if (i === 6) {
                return 1;
            }
        }

        // check tie
        for (let i = 0; i < 9; i++) {
            if (GameBoard.board[i] === "&nbsp;") {
                break;
            }
            if (i === 8) {
                return -1;
            }
        }

        return 0;
    }

    let startGame = (e) => {
        e.target.parentElement.removeChild(e.target);
        DisplayController.renderPlayerNames();
        GameBoard.reset();

        GameController.listenForTurn(0);
        gameOver = false;
    }

    let listenForTurn = (playerNum) => {
        DisplayController.renderTurnIndicator(playerNum);
        players.forEach(player => player.myTurn = false);
        players[playerNum].myTurn = true;
    }

    let createPlayer = (name) => {
        if (players.length === 0) {
            players.push(Player(name, "o"));
        } else if (players.length === 1) {
            players.push(Player(name, "x"));
        }
    }
    return {
        play,
        startGame,
        listenForTurn,
        createPlayer,
        checkIfWon,
        endGame,
        restartGame
    }
})();

const Player = (n, s) => {

    let myTurn = false;
    let name = n;
    let symbol = s;


    return {
        name,
        symbol,
        myTurn
    };
};