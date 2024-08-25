document.addEventListener("DOMContentLoaded", () => {
    const levelSettings = {
        Easy: { boardSize: 9, time: 200, maxWordLength: 7, maxWords: 4 },
        Medium: { boardSize: 12, time: 180, maxWordLength: 8, maxWords: 6 },
        Hard: { boardSize: 15, time: 160, maxWordLength: 10, maxWords: 8 }
    };

    let currentLevel = "Easy";
    let gameRunning = false;
    let timerRunning = false;
    let score = 0;
    let timeLeft = 300;
    let selectedWord = "";
    let selectedCells = [];
    let wordsToFind = [];
    let board = [];

    const levelSelection = document.getElementById("levelSelection");
    const game = document.getElementById("game");
    const welcome = document.getElementById("welcome");
    const constraintsLabel = document.getElementById("constraints");
    const scoreLabel = document.getElementById("score");
    const timeLabel = document.getElementById("time");
    const wordListInput = document.getElementById("wordList");
    const boardDiv = document.getElementById("board");

    document.getElementById("startBtn").addEventListener("click", () => {
        welcome.classList.add("hidden");
        levelSelection.classList.remove("hidden");
    });

    document.getElementById("nextBtn").addEventListener("click", () => {
        currentLevel = document.querySelector('input[name="level"]:checked').value;
        const settings = levelSettings[currentLevel];
        constraintsLabel.innerText = `${currentLevel} Level:\nMAXIMUM WORDS = ${settings.maxWords}\nMAXIMUM WORD LENGTH = ${settings.maxWordLength}`;
        levelSelection.classList.add("hidden");
        game.classList.remove("hidden");
        resetGame();
    });

    document.getElementById("generateBtn").addEventListener("click", () => {
        if (generatePuzzle()) {
            if (!timerRunning) {
                timerRunning = true;
                updateTimer();
            }
        }
    });

    function resetGame() {
        score = 0;
        timeLeft = levelSettings[currentLevel].time;
        scoreLabel.innerText = `Score: ${score}`;
        timeLabel.innerText = `Time left: ${timeLeft} seconds`;
        timerRunning = false;
        gameRunning = true;
        boardDiv.innerHTML = '';
        wordsToFind = [];
        selectedWord = '';
        selectedCells = [];
    }

    function updateTimer() {
        if (timerRunning) {
            timeLeft -= 1;
            timeLabel.innerText = `Time left: ${timeLeft} seconds`;
            if (timeLeft <= 0) {
                timerRunning = false;
                gameOver();
            } else {
                setTimeout(updateTimer, 1000);
            }
        }
    }

    function generatePuzzle() {
        const words = wordListInput.value.split(',').map(word => word.trim().toUpperCase());
        if (validateWords(words)) {
            wordsToFind = [...words];
            board = createWordSearch(words);
            if (board) {
                renderBoard(board);
                return true; // Indicate successful generation
            } else {
                alert("Failed to generate the puzzle. Please try again.");
                return false; // Indicate failure
            }
        }
        return false; // Indicate failure
    }

    function validateWords(words) {
        const settings = levelSettings[currentLevel];
        const invalidWords = words.filter(word => !/^[A-Z0-9]+$/.test(word));
        if (invalidWords.length > 0) {
            alert("Words can only contain alphabetic characters and numbers.");
            return false;
        }
        const tooLong = words.filter(word => word.length > settings.maxWordLength);
        if (tooLong.length > 0) {
            alert(`Words cannot be longer than ${settings.maxWordLength} characters.`);
            return false;
        }
        if (words.length > settings.maxWords) {
            alert(`You cannot enter more than ${settings.maxWords} words.`);
            return false;
        }
        return true;
    }

    function createWordSearch(words) {
        const size = levelSettings[currentLevel].boardSize;
        const board = Array.from({ length: size }, () => Array(size).fill('-'));

        words.forEach(word => placeWord(board, word));
        fillEmpty(board);

        return board;
    }

    function placeWord(board, word) {
        const size = board.length;
        const directions = [[1, 0], [0, 1], [1, 1], [1, -1], [-1, 0], [0, -1], [-1, -1], [-1, 1]];
        shuffleArray(directions);

        for (let i = 0; i < 100; i++) {
            const [dirX, dirY] = directions[Math.floor(Math.random() * directions.length)];
            const row = Math.floor(Math.random() * size);
            const col = Math.floor(Math.random() * size);

            let valid = true;
            let r = row, c = col;
            for (const letter of word) {
                if (r < 0 || r >= size || c < 0 || c >= size || (board[r][c] !== '-' && board[r][c] !== letter)) {
                    valid = false;
                    break;
                }
                r += dirX;
                c += dirY;
            }
            if (valid) {
                r = row; c = col;
                for (const letter of word) {
                    board[r][c] = letter;
                    r += dirX;
                    c += dirY;
                }
                return;
            }
        }
        return null; // Indicate failure to place word
    }

    function fillEmpty(board) {
        const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        board.forEach((row, r) => row.forEach((cell, c) => {
            if (cell === '-') {
                board[r][c] = letters[Math.floor(Math.random() * letters.length)];
            }
        }));
    }

    function renderBoard(board) {
        const size = board.length;
        boardDiv.style.gridTemplateColumns = `repeat(${size}, 40px)`;
        boardDiv.style.gridTemplateRows = `repeat(${size}, 40px)`;

        board.forEach((row, r) => row.forEach((letter, c) => {
            const cell = document.createElement('div');
            cell.innerText = letter;
            cell.dataset.row = r;
            cell.dataset.col = c;
            cell.addEventListener('click', handleCellClick);
            boardDiv.appendChild(cell);
        }));
    }

    function handleCellClick(event) {
        if (!gameRunning) return;

        const cell = event.target;
        const row = parseInt(cell.dataset.row, 10);
        const col = parseInt(cell.dataset.col, 10);
        const letter = board[row][col];

        cell.classList.add('selected');
        selectedWord += letter;
        selectedCells.push({ row, col });

        if (wordsToFind.some(word => word.startsWith(selectedWord))) {
            if (wordsToFind.includes(selectedWord)) {
                wordsToFind = wordsToFind.filter(word => word !== selectedWord);
                score += selectedWord.length;
                scoreLabel.innerText = `Score: ${score}`;
                selectedCells.forEach(({ row, col }) => {
                    const cell = boardDiv.querySelector(`div[data-row="${row}"][data-col="${col}"]`);
                    cell.classList.add('correct');
                });
                selectedWord = '';
                selectedCells = [];
                if (wordsToFind.length === 0) {
                    gameOver();
                }
            }
        } else {
            alert("This selection doesn't match any word.");
            selectedCells.forEach(({ row, col }) => {
                const cell = boardDiv.querySelector(`div[data-row="${row}"][data-col="${col}"]`);
                cell.classList.add('incorrect');
            });
            selectedWord = '';
            selectedCells = [];
        }
    }

    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    function gameOver() {
        gameRunning = false;
        timerRunning = false;
        alert(`Game Over! Your score: ${score}`);
        if (confirm("Would you like to play again?")) {
            location.reload();
        }
    }
});
