let board;
let grid = [];
let solution;

function showLevelSelection() {
    document.getElementById("welcome-page").style.display = "none";
    document.getElementById("level-selection-page").style.display = "block";
}

function startGame(level) {
    document.getElementById("level-selection-page").style.display = "none";
    document.getElementById("game-page").style.display = "block";
    generatePuzzle(level);
}

function generatePuzzle(level) {
    board = createBoard();
    solution = solveSudoku(board);
    let puzzle = board;

    // Set difficulty by removing cells from the puzzle
    let emptyCells = (level === "easy") ? 81 / 6 : (level === "medium") ? 81 / 4 : 81 / 3;
    while (emptyCells > 0) {
        let row = Math.floor(Math.random() * 9);
        let col = Math.floor(Math.random() * 9);
        if (puzzle[row][col] !== 0) {
            puzzle[row][col] = 0;
            emptyCells--;
        }
    }

    renderBoard(puzzle);
}

function createBoard() {
    const board = Array.from({ length: 9 }, () => Array(9).fill(0));
    for (let i = 0; i < 9; i++) {
        for (let j = 0; j < 9; j++) {
            const num = Math.floor(Math.random() * 9) + 1;
            if (isSafe(board, i, j, num)) {
                board[i][j] = num;
            }
        }
    }
    return board;
}

function isSafe(board, row, col, num) {
    for (let i = 0; i < 9; i++) {
        if (board[row][i] === num || board[i][col] === num) return false;
    }

    const boxStartRow = Math.floor(row / 3) * 3;
    const boxStartCol = Math.floor(col / 3) * 3;
    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            if (board[boxStartRow + i][boxStartCol + j] === num) return false;
        }
    }
    return true;
}

function renderBoard(puzzle) {
    const boardElement = document.getElementById("board");
    boardElement.innerHTML = "";

    grid = [];
    for (let i = 0; i < 9; i++) {
        for (let j = 0; j < 9; j++) {
            const input = document.createElement("input");
            input.type = "text";
            input.maxLength = 1;
            input.value = puzzle[i][j] !== 0 ? puzzle[i][j] : "";
            if (puzzle[i][j] !== 0) {
                input.setAttribute("readonly", true);
            } else {
                input.addEventListener("input", () => {
                    board[i][j] = parseInt(input.value) || 0;
                });
            }
            boardElement.appendChild(input);
            grid.push(input);
        }
    }
}

function solveSudoku(board) {
    const empty = findEmpty(board);
    if (!empty) return board;
    const [row, col] = empty;

    for (let num = 1; num <= 9; num++) {
        if (isSafe(board, row, col, num)) {
            board[row][col] = num;
            if (solveSudoku(board)) return board;
            board[row][col] = 0;
        }
    }
    return null;
}

function findEmpty(board) {
    for (let i = 0; i < 9; i++) {
        for (let j = 0; j < 9; j++) {
            if (board[i][j] === 0) return [i, j];
        }
    }
    return null;
}

function solvePuzzle() {
    const solvedBoard = solveSudoku([...board]);
    renderBoard(solvedBoard);
    showMessage("Puzzle solved!");
}

function checkSolution() {
    let isCorrect = true;
    for (let i = 0; i < 9; i++) {
        for (let j = 0; j < 9; j++) {
            const inputValue = grid[i * 9 + j].value;
            if (parseInt(inputValue) !== solution[i][j]) {
                isCorrect = false;
                break;
            }
        }
    }

    if (isCorrect) {
        showMessage("Solution is correct!");
    } else {
        showMessage("Solution is incorrect!");
    }
}

function resetPuzzle() {
    generatePuzzle("easy");
    document.getElementById("message").innerText = "";
}

function showMessage(message) {
    document.getElementById("message").innerText = message;
}

// Show welcome page initially
document.getElementById("welcome-page").style.display = "block";
