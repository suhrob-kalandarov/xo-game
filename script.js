// Global Variables
let currentPage = "dashboard"
let currentNestedSidebar = null
let activeMenuItem = null
let selectedFriend = null

// Game Variables
const gameState = {
    board: [],
    currentPlayer: "X",
    gameMode: "simple",
    boardSize: 3,
    opponent: "",
    isGameActive: true,
    playerScore: 0,
    opponentScore: 0,
    winCondition: 3,
}

// Super Game Variables
const superGameState = {
    boards: Array(9)
        .fill()
        .map(() => Array(9).fill("")),
    mainBoard: Array(9).fill(""),
    currentPlayer: "X",
    nextBoardIndex: null,
    opponent: "",
    isGameActive: true,
    playerScore: 0,
    opponentScore: 0,
    drawTimers: Array(9).fill(null),
    drawCountdowns: Array(9).fill(null),
    autoResetTimer: null,
    autoResetCountdown: null,
    gameTime: 0,
    gameTimeInterval: null,
}

// Page Management
function showPage(pageId) {
    loadPage(pageId)
    closeSidebars()
}

function loadPage(pageId) {
    const pageContainer = document.getElementById("pageContainer")

    // Clear current content
    pageContainer.innerHTML = ""

    // Load page content
    fetch(`pages/${pageId}.html`)
        .then((response) => response.text())
        .then((html) => {
            pageContainer.innerHTML = html
            currentPage = pageId

            // Initialize page-specific functionality
            initializePage(pageId)
        })
        .catch((error) => {
            console.error("Error loading page:", error)
            pageContainer.innerHTML = '<div class="page-card"><h1>Page not found</h1></div>'
        })
}

function initializePage(pageId) {
    switch (pageId) {
        case "friends":
            initializeFriendsPage()
            break
        case "profile":
            initializeProfilePage()
            break
        case "game":
            initializeGamePage()
            break
        case "super-game":
            initializeSuperGamePage()
            break
        default:
            break
    }
}

// Game Functions
function initializeGamePage() {
    console.log("🎮 Game page initialized!")

    // Update game info display
    updateGameInfo()

    // Create game board
    createGameBoard()

    // Update game status
    updateGameStatus()
}

function startGame(opponent, gameMode, boardSize) {
    // Set game parameters
    gameState.opponent = opponent
    gameState.gameMode = gameMode
    gameState.boardSize = Number.parseInt(boardSize.split("x")[0])
    gameState.winCondition = gameState.boardSize >= 5 ? 4 : 3 // 4 in a row for larger boards

    // Reset game state
    resetGameState()

    // Navigate to game page
    showPage("game")
}

function resetGameState() {
    const size = gameState.boardSize
    gameState.board = Array(size * size).fill("")
    gameState.currentPlayer = "X"
    gameState.isGameActive = true
}

function createGameBoard() {
    const gameBoard = document.getElementById("gameBoard")
    if (!gameBoard) return

    const size = gameState.boardSize

    // Clear existing board
    gameBoard.innerHTML = ""

    // Set board size class
    gameBoard.className = `game-board size-${size}`

    // Create board cells
    for (let i = 0; i < size * size; i++) {
        const cell = document.createElement("div")
        cell.className = "board-cell"
        cell.dataset.index = i
        cell.addEventListener("click", () => handleCellClick(i))
        gameBoard.appendChild(cell)
    }
}

function handleCellClick(index) {
    // Check if game is active and cell is empty
    if (!gameState.isGameActive || gameState.board[index] !== "") {
        return
    }

    // Make move
    makeMove(index, gameState.currentPlayer)

    // Check for win or draw
    if (checkWin(gameState.currentPlayer)) {
        endGame(gameState.currentPlayer)
        return
    }

    if (checkDraw()) {
        endGame("draw")
        return
    }

    // Switch player
    gameState.currentPlayer = gameState.currentPlayer === "X" ? "O" : "X"
    updateGameStatus()

    // AI move for opponent (simple random move)
    if (gameState.currentPlayer === "O") {
        setTimeout(() => {
            makeAIMove()
        }, 500)
    }
}

function makeMove(index, player) {
    gameState.board[index] = player

    const cell = document.querySelector(`[data-index="${index}"]`)
    if (cell) {
        cell.textContent = player
        cell.classList.add("filled", `player-${player.toLowerCase()}`)
    }
}

function makeAIMove() {
    if (!gameState.isGameActive) return

    // Simple AI: random empty cell
    const emptyCells = gameState.board
        .map((cell, index) => (cell === "" ? index : null))
        .filter((index) => index !== null)

    if (emptyCells.length === 0) return

    const randomIndex = emptyCells[Math.floor(Math.random() * emptyCells.length)]

    makeMove(randomIndex, "O")

    // Check for win or draw
    if (checkWin("O")) {
        endGame("O")
        return
    }

    if (checkDraw()) {
        endGame("draw")
        return
    }

    // Switch back to player
    gameState.currentPlayer = "X"
    updateGameStatus()
}

function checkWin(player) {
    const size = gameState.boardSize
    const winCondition = gameState.winCondition
    const board = gameState.board

    // Check rows
    for (let row = 0; row < size; row++) {
        for (let col = 0; col <= size - winCondition; col++) {
            let count = 0
            const winningCells = []

            for (let i = 0; i < winCondition; i++) {
                const index = row * size + col + i
                if (board[index] === player) {
                    count++
                    winningCells.push(index)
                }
            }

            if (count === winCondition) {
                highlightWinningCells(winningCells)
                return true
            }
        }
    }

    // Check columns
    for (let col = 0; col < size; col++) {
        for (let row = 0; row <= size - winCondition; row++) {
            let count = 0
            const winningCells = []

            for (let i = 0; i < winCondition; i++) {
                const index = (row + i) * size + col
                if (board[index] === player) {
                    count++
                    winningCells.push(index)
                }
            }

            if (count === winCondition) {
                highlightWinningCells(winningCells)
                return true
            }
        }
    }

    // Check diagonals (top-left to bottom-right)
    for (let row = 0; row <= size - winCondition; row++) {
        for (let col = 0; col <= size - winCondition; col++) {
            let count = 0
            const winningCells = []

            for (let i = 0; i < winCondition; i++) {
                const index = (row + i) * size + (col + i)
                if (board[index] === player) {
                    count++
                    winningCells.push(index)
                }
            }

            if (count === winCondition) {
                highlightWinningCells(winningCells)
                return true
            }
        }
    }

    // Check diagonals (top-right to bottom-left)
    for (let row = 0; row <= size - winCondition; row++) {
        for (let col = winCondition - 1; col < size; col++) {
            let count = 0
            const winningCells = []

            for (let i = 0; i < winCondition; i++) {
                const index = (row + i) * size + (col - i)
                if (board[index] === player) {
                    count++
                    winningCells.push(index)
                }
            }

            if (count === winCondition) {
                highlightWinningCells(winningCells)
                return true
            }
        }
    }

    return false
}

function checkDraw() {
    return gameState.board.every((cell) => cell !== "")
}

function highlightWinningCells(cells) {
    cells.forEach((index) => {
        const cell = document.querySelector(`[data-index="${index}"]`)
        if (cell) {
            cell.classList.add("winning-cell")
        }
    })
}

function endGame(winner) {
    gameState.isGameActive = false

    // Update scores
    if (winner === "X") {
        gameState.playerScore++
    } else if (winner === "O") {
        gameState.opponentScore++
    }

    updateScoreDisplay()

    // Show result modal
    setTimeout(() => {
        showGameResult(winner)
    }, 1000)
}

function showGameResult(winner) {
    const modal = document.getElementById("gameResultModal")
    const resultIcon = document.getElementById("resultIcon")
    const resultText = document.getElementById("resultText")

    if (!modal || !resultIcon || !resultText) return

    // Clear previous classes
    resultIcon.className = "result-icon"

    if (winner === "X") {
        resultIcon.classList.add("win")
        resultIcon.innerHTML = '<i class="fas fa-trophy"></i>'
        resultText.textContent = "Siz yutdingiz! 🎉"
    } else if (winner === "O") {
        resultIcon.classList.add("lose")
        resultIcon.innerHTML = '<i class="fas fa-times-circle"></i>'
        resultText.textContent = "Siz yutqazdingiz! 😔"
    } else {
        resultIcon.classList.add("draw")
        resultIcon.innerHTML = '<i class="fas fa-handshake"></i>'
        resultText.textContent = "Durrang! 🤝"
    }

    modal.classList.remove("d-none")
}

function updateGameInfo() {
    const modeElement = document.getElementById("currentGameMode")
    const sizeElement = document.getElementById("currentBoardSize")
    const opponentElement = document.getElementById("currentOpponent")

    if (modeElement) modeElement.textContent = gameState.gameMode
    if (sizeElement) sizeElement.textContent = `${gameState.boardSize}x${gameState.boardSize}`
    if (opponentElement) opponentElement.textContent = gameState.opponent
}

function updateGameStatus() {
    const playerIndicator = document.getElementById("currentPlayerIndicator")
    const playerIcon = document.getElementById("playerIcon")
    const playerName = document.getElementById("playerName")

    if (!playerIndicator || !playerIcon || !playerName) return

    if (gameState.currentPlayer === "X") {
        playerIndicator.className = "player-indicator"
        playerIcon.className = "fas fa-times"
        playerName.textContent = "Siz"
    } else {
        playerIndicator.className = "player-indicator player-o"
        playerIcon.className = "fas fa-circle"
        playerName.textContent = gameState.opponent
    }
}

function updateScoreDisplay() {
    const playerScore = document.getElementById("playerScore")
    const opponentScore = document.getElementById("opponentScore")

    if (playerScore) playerScore.textContent = gameState.playerScore
    if (opponentScore) opponentScore.textContent = gameState.opponentScore
}

function restartGame() {
    resetGameState()
    createGameBoard()
    updateGameStatus()

    // Hide result modal if visible
    const modal = document.getElementById("gameResultModal")
    if (modal) {
        modal.classList.add("d-none")
    }

    showNotification("🔄 O'yin qayta boshlandi!", "info")
}

function newGame() {
    gameState.playerScore = 0
    gameState.opponentScore = 0
    updateScoreDisplay()
    restartGame()
    showNotification("🆕 Yangi o'yin boshlandi!", "success")
}

function quitGame() {
    if (confirm("Rostdan ham o'yindan chiqishni xohlaysizmi?")) {
        showPage("friends")
        showNotification("👋 O'yindan chiqildi", "info")
    }
}

function playAgain() {
    restartGame()
}

function backToFriends() {
    showPage("friends")
}

// Super Game Functions
function initializeSuperGamePage() {
    console.log("👑 Super Game page initialized!")

    // Update game info display
    updateSuperGameInfo()

    // Create super game board
    createSuperGameBoard()

    // Update game status
    updateSuperGameStatus()

    // Start game timer
    startSuperGameTimer()
}

function startSuperGame(opponent, gameMode, boardSize) {
    // Set game parameters
    superGameState.opponent = opponent

    // Reset game state
    resetSuperGameState()

    // Navigate to super game page
    showPage("super-game")
}

function resetSuperGameState() {
    superGameState.boards = Array(9)
        .fill()
        .map(() => Array(9).fill(""))
    superGameState.mainBoard = Array(9).fill("")
    superGameState.currentPlayer = "X"
    superGameState.nextBoardIndex = null
    superGameState.isGameActive = true
    superGameState.gameTime = 0

    // Clear all timers
    clearSuperGameTimers()
}

function clearSuperGameTimers() {
    // Clear draw timers
    for (let i = 0; i < 9; i++) {
        if (superGameState.drawTimers[i]) {
            clearInterval(superGameState.drawTimers[i])
            superGameState.drawTimers[i] = null
        }
    }

    // Clear auto reset timer
    if (superGameState.autoResetTimer) {
        clearInterval(superGameState.autoResetTimer)
        superGameState.autoResetTimer = null
    }

    // Clear game timer
    if (superGameState.gameTimeInterval) {
        clearInterval(superGameState.gameTimeInterval)
        superGameState.gameTimeInterval = null
    }
}

function createSuperGameBoard() {
    const gameBoard = document.getElementById("superGameBoard")
    if (!gameBoard) return

    // Clear existing board
    gameBoard.innerHTML = ""

    // Create 9 big cells
    for (let i = 0; i < 9; i++) {
        const bigCell = document.createElement("div")
        bigCell.className = "super-big-cell"
        bigCell.dataset.index = i

        // Check if this board is active
        if (
            (superGameState.nextBoardIndex === null || superGameState.nextBoardIndex === i) &&
            (superGameState.mainBoard[i] === "" || superGameState.mainBoard[i] === "draw-active")
        ) {
            bigCell.classList.add("active-board")
        }

        // Create content based on board state
        if (superGameState.mainBoard[i] === "X") {
            bigCell.classList.add("x-won")
            bigCell.innerHTML = '<div class="super-big-cell-content"><i class="fas fa-times super-big-x-mark"></i></div>'
        } else if (superGameState.mainBoard[i] === "O") {
            bigCell.classList.add("o-won")
            bigCell.innerHTML = '<div class="super-big-cell-content"><i class="fas fa-circle super-big-o-mark"></i></div>'
        } else if (superGameState.mainBoard[i] === "draw-active") {
            bigCell.classList.add("draw-active")
            bigCell.innerHTML = `
        <div class="super-big-cell-content">
          <div>DRAW</div>
          <div class="super-countdown" id="super-countdown-${i}">${superGameState.drawCountdowns[i]}</div>
        </div>
      `
        } else if (superGameState.mainBoard[i] === "draw") {
            bigCell.classList.add("draw")
            bigCell.innerHTML = '<div class="super-big-cell-content">DRAW</div>'
        } else {
            // Create small board
            const smallBoard = document.createElement("div")
            smallBoard.className = "super-small-board"

            for (let j = 0; j < 9; j++) {
                const smallCell = document.createElement("div")
                smallCell.className = "super-small-cell"
                smallCell.dataset.boardIndex = i
                smallCell.dataset.cellIndex = j

                // Set cell content
                if (superGameState.boards[i][j] === "X") {
                    smallCell.textContent = "×"
                    smallCell.classList.add("filled", "player-x")
                } else if (superGameState.boards[i][j] === "O") {
                    smallCell.textContent = "○"
                    smallCell.classList.add("filled", "player-o")
                }

                // Check if cell is clickable
                const isBoardActive =
                    (superGameState.nextBoardIndex === null || superGameState.nextBoardIndex === i) &&
                    (superGameState.mainBoard[i] === "" || superGameState.mainBoard[i] === "draw-active")
                const isCellEmpty = superGameState.boards[i][j] === ""

                if (isBoardActive && isCellEmpty && superGameState.isGameActive) {
                    smallCell.addEventListener("click", () => handleSuperCellClick(i, j))
                } else {
                    smallCell.classList.add("disabled")
                }

                smallBoard.appendChild(smallCell)
            }

            bigCell.appendChild(smallBoard)
        }

        gameBoard.appendChild(bigCell)
    }

    updateSuperNextBoardInfo()
}

function handleSuperCellClick(boardIndex, cellIndex) {
    // Check if move is valid
    if (
        !superGameState.isGameActive ||
        superGameState.boards[boardIndex][cellIndex] !== "" ||
        (superGameState.nextBoardIndex !== null && superGameState.nextBoardIndex !== boardIndex) ||
        (superGameState.mainBoard[boardIndex] !== "" && superGameState.mainBoard[boardIndex] !== "draw-active")
    ) {
        return
    }

    // Make move
    superGameState.boards[boardIndex][cellIndex] = superGameState.currentPlayer

    // Check if this move won the small board
    const boardWinner = checkSuperBoardWinner(superGameState.boards[boardIndex])

    if (boardWinner === "X" || boardWinner === "O") {
        superGameState.mainBoard[boardIndex] = boardWinner

        // Clear any draw timer
        if (superGameState.drawTimers[boardIndex]) {
            clearInterval(superGameState.drawTimers[boardIndex])
            superGameState.drawTimers[boardIndex] = null
        }
    } else if (boardWinner === "draw") {
        // Start draw countdown
        superGameState.mainBoard[boardIndex] = "draw-active"
        superGameState.drawCountdowns[boardIndex] = 15

        // Clear existing timer
        if (superGameState.drawTimers[boardIndex]) {
            clearInterval(superGameState.drawTimers[boardIndex])
        }

        // Start countdown
        superGameState.drawTimers[boardIndex] = setInterval(() => {
            superGameState.drawCountdowns[boardIndex]--

            const countdownElement = document.getElementById(`super-countdown-${boardIndex}`)
            if (countdownElement) {
                countdownElement.textContent = superGameState.drawCountdowns[boardIndex]
            }

            if (superGameState.drawCountdowns[boardIndex] <= 0) {
                clearInterval(superGameState.drawTimers[boardIndex])
                superGameState.mainBoard[boardIndex] = "draw"
                createSuperGameBoard()
                checkSuperGameWinner()
            }
        }, 1000)
    }

    // Check if game is won
    checkSuperGameWinner()

    // Set next board
    if (superGameState.mainBoard[cellIndex] === "" || superGameState.mainBoard[cellIndex] === "draw-active") {
        superGameState.nextBoardIndex = cellIndex
    } else {
        superGameState.nextBoardIndex = null
    }

    // Switch players
    superGameState.currentPlayer = superGameState.currentPlayer === "X" ? "O" : "X"
    updateSuperGameStatus()

    // Recreate board
    createSuperGameBoard()

    // AI move for opponent
    if (superGameState.currentPlayer === "O") {
        setTimeout(() => {
            makeSuperAIMove()
        }, 1000)
    }
}

function makeSuperAIMove() {
    if (!superGameState.isGameActive) return

    // Find valid moves
    const validMoves = []

    for (let i = 0; i < 9; i++) {
        // Check if this board is playable
        const isBoardActive =
            (superGameState.nextBoardIndex === null || superGameState.nextBoardIndex === i) &&
            (superGameState.mainBoard[i] === "" || superGameState.mainBoard[i] === "draw-active")

        if (isBoardActive) {
            for (let j = 0; j < 9; j++) {
                if (superGameState.boards[i][j] === "") {
                    validMoves.push({ boardIndex: i, cellIndex: j })
                }
            }
        }
    }

    if (validMoves.length === 0) return

    // Make random move
    const randomMove = validMoves[Math.floor(Math.random() * validMoves.length)]
    const { boardIndex, cellIndex } = randomMove

    // Make move
    superGameState.boards[boardIndex][cellIndex] = "O"

    // Check if this move won the small board
    const boardWinner = checkSuperBoardWinner(superGameState.boards[boardIndex])

    if (boardWinner === "X" || boardWinner === "O") {
        superGameState.mainBoard[boardIndex] = boardWinner

        if (superGameState.drawTimers[boardIndex]) {
            clearInterval(superGameState.drawTimers[boardIndex])
            superGameState.drawTimers[boardIndex] = null
        }
    } else if (boardWinner === "draw") {
        superGameState.mainBoard[boardIndex] = "draw-active"
        superGameState.drawCountdowns[boardIndex] = 15

        if (superGameState.drawTimers[boardIndex]) {
            clearInterval(superGameState.drawTimers[boardIndex])
        }

        superGameState.drawTimers[boardIndex] = setInterval(() => {
            superGameState.drawCountdowns[boardIndex]--

            const countdownElement = document.getElementById(`super-countdown-${boardIndex}`)
            if (countdownElement) {
                countdownElement.textContent = superGameState.drawCountdowns[boardIndex]
            }

            if (superGameState.drawCountdowns[boardIndex] <= 0) {
                clearInterval(superGameState.drawTimers[boardIndex])
                superGameState.mainBoard[boardIndex] = "draw"
                createSuperGameBoard()
                checkSuperGameWinner()
            }
        }, 1000)
    }

    // Check if game is won
    checkSuperGameWinner()

    // Set next board
    if (superGameState.mainBoard[cellIndex] === "" || superGameState.mainBoard[cellIndex] === "draw-active") {
        superGameState.nextBoardIndex = cellIndex
    } else {
        superGameState.nextBoardIndex = null
    }

    // Switch back to player
    superGameState.currentPlayer = "X"
    updateSuperGameStatus()

    // Recreate board
    createSuperGameBoard()
}

function checkSuperBoardWinner(board) {
    const lines = [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8], // rows
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8], // columns
        [0, 4, 8],
        [2, 4, 6], // diagonals
    ]

    for (const [a, b, c] of lines) {
        if (board[a] && board[a] === board[b] && board[a] === board[c]) {
            return board[a]
        }
    }

    // Check for draw
    if (board.every((cell) => cell !== "")) {
        return "draw"
    }

    return null
}

function checkSuperGameWinner() {
    // Create board for winner checking
    const boardForWinnerCheck = superGameState.mainBoard.map((cell) => {
        if (cell === "draw-active" || cell === "draw") {
            return null
        }
        return cell
    })

    const gameWinner = checkSuperBoardWinner(boardForWinnerCheck)

    if (gameWinner) {
        superGameState.isGameActive = false

        // Update scores
        if (gameWinner === "X") {
            superGameState.playerScore++
        } else if (gameWinner === "O") {
            superGameState.opponentScore++
        }

        updateSuperScoreDisplay()
        showSuperGameResult(gameWinner)
    } else {
        // Check if game is draw
        const isGameDraw = superGameState.mainBoard.every((cell) => cell !== "")
        if (isGameDraw) {
            superGameState.isGameActive = false
            showSuperGameResult("draw")
        }
    }
}

function showSuperGameResult(winner) {
    const modal = document.getElementById("superGameResultModal")
    const resultIcon = document.getElementById("superResultIcon")
    const resultText = document.getElementById("superResultText")

    if (!modal || !resultIcon || !resultText) return

    // Clear previous classes
    resultIcon.className = "result-icon"

    if (winner === "X") {
        resultIcon.classList.add("win")
        resultIcon.innerHTML = '<i class="fas fa-crown"></i>'
        resultText.textContent = "Siz Super Champion bo'ldingiz! 👑"
    } else if (winner === "O") {
        resultIcon.classList.add("lose")
        resultIcon.innerHTML = '<i class="fas fa-times-circle"></i>'
        resultText.textContent = "Raqib yutdi! Keyingi safar omad! 😔"
    } else {
        resultIcon.classList.add("draw")
        resultIcon.innerHTML = '<i class="fas fa-handshake"></i>'
        resultText.textContent = "Super Durrang! Ikkalangiz ham zo'r! 🤝"
    }

    modal.classList.remove("d-none")
}

function updateSuperGameInfo() {
    const opponentElement = document.getElementById("superCurrentOpponent")
    if (opponentElement) opponentElement.textContent = superGameState.opponent
}

function updateSuperGameStatus() {
    const playerIndicator = document.getElementById("superCurrentPlayerIndicator")
    const playerIcon = document.getElementById("superPlayerIcon")
    const playerName = document.getElementById("superPlayerName")

    if (!playerIndicator || !playerIcon || !playerName) return

    if (superGameState.currentPlayer === "X") {
        playerIndicator.className = "player-indicator"
        playerIcon.className = "fas fa-times"
        playerName.textContent = "Siz"
    } else {
        playerIndicator.className = "player-indicator player-o"
        playerIcon.className = "fas fa-circle"
        playerName.textContent = superGameState.opponent
    }
}

function updateSuperScoreDisplay() {
    const playerScore = document.getElementById("superPlayerScore")
    const opponentScore = document.getElementById("superOpponentScore")

    if (playerScore) playerScore.textContent = superGameState.playerScore
    if (opponentScore) opponentScore.textContent = superGameState.opponentScore
}

function updateSuperNextBoardInfo() {
    const infoElement = document.getElementById("superNextBoardInfo")
    if (!infoElement) return

    if (superGameState.nextBoardIndex === null) {
        infoElement.textContent = "Istalgan boardda o'ynashingiz mumkin"
    } else {
        const boardNames = [
            "Yuqori chap",
            "Yuqori o'rta",
            "Yuqori o'ng",
            "O'rta chap",
            "Markaziy",
            "O'rta o'ng",
            "Pastki chap",
            "Pastki o'rta",
            "Pastki o'ng",
        ]
        infoElement.textContent = `${boardNames[superGameState.nextBoardIndex]} boardda o'ynang`
    }
}

function startSuperGameTimer() {
    if (superGameState.gameTimeInterval) {
        clearInterval(superGameState.gameTimeInterval)
    }

    superGameState.gameTimeInterval = setInterval(() => {
        superGameState.gameTime++
        const minutes = Math.floor(superGameState.gameTime / 60)
        const seconds = superGameState.gameTime % 60
        const timeString = `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`

        const timeElement = document.getElementById("superGameTime")
        if (timeElement) {
            timeElement.textContent = timeString
        }
    }, 1000)
}

function restartSuperGame() {
    resetSuperGameState()
    createSuperGameBoard()
    updateSuperGameStatus()
    startSuperGameTimer()

    // Hide result modal if visible
    const modal = document.getElementById("superGameResultModal")
    if (modal) {
        modal.classList.add("d-none")
    }

    showNotification("🔄 Super o'yin qayta boshlandi!", "info")
}

function newSuperGame() {
    superGameState.playerScore = 0
    superGameState.opponentScore = 0
    updateSuperScoreDisplay()
    restartSuperGame()
    showNotification("🆕 Yangi Super o'yin boshlandi!", "success")
}

function quitSuperGame() {
    if (confirm("Rostdan ham Super o'yindan chiqishni xohlaysizmi?")) {
        clearSuperGameTimers()
        showPage("friends")
        showNotification("👋 Super o'yindan chiqildi", "info")
    }
}

function playSuperAgain() {
    restartSuperGame()
}

// Sidebar Management
function toggleSidebar() {
    const sidebar = document.getElementById("mainSidebar")
    const overlay = document.getElementById("overlay")

    if (sidebar.classList.contains("active")) {
        closeNestedSidebar()
        clearActiveMenuItems()
        sidebar.classList.remove("active")
        overlay.classList.remove("active")
    } else {
        sidebar.classList.add("active")
        overlay.classList.add("active")
    }
}

function openNestedSidebar(type) {
    closeNestedSidebar()
    setActiveMenuItem(type)

    const nestedSidebar = document.getElementById(type + "Sidebar")
    if (nestedSidebar) {
        nestedSidebar.classList.add("active")
        currentNestedSidebar = nestedSidebar
    }
}

function closeNestedSidebar() {
    if (currentNestedSidebar) {
        currentNestedSidebar.classList.remove("active")
        currentNestedSidebar = null
    }
    clearActiveMenuItems()
}

function closeSidebars() {
    const sidebar = document.getElementById("mainSidebar")
    const overlay = document.getElementById("overlay")

    closeNestedSidebar()
    sidebar.classList.remove("active")
    overlay.classList.remove("active")
}

function setActiveMenuItem(menuType) {
    clearActiveMenuItems()
    const menuItem = document.querySelector(`[data-menu="${menuType}"]`)
    if (menuItem) {
        menuItem.classList.add("active")
        activeMenuItem = menuItem
    }
}

function clearActiveMenuItems() {
    document.querySelectorAll(".menu-item[data-menu]").forEach((item) => {
        item.classList.remove("active")
    })
    activeMenuItem = null
}

// Friends Page Functions
function initializeFriendsPage() {
    // Initialize duel form
    const duelForm = document.getElementById("duelForm")
    if (duelForm) {
        duelForm.addEventListener("submit", handleDuelSubmit)
    }

    // Set default tab
    switchTab("send")
}

function switchTab(tabName) {
    // Remove active class from all tabs and contents
    document.querySelectorAll(".tab-btn").forEach((btn) => btn.classList.remove("active"))
    document.querySelectorAll(".tab-content").forEach((content) => content.classList.remove("active"))

    // Add active class to selected tab and content
    const tabBtn = document.getElementById(tabName + "Tab")
    const tabContent = document.getElementById(tabName + "Content")

    if (tabBtn && tabContent) {
        tabBtn.classList.add("active")
        tabContent.classList.add("active")
    }
}

function selectFriend(username) {
    // Remove selected class from all chips
    document.querySelectorAll(".friend-chip-compact").forEach((chip) => {
        chip.classList.remove("selected")
    })

    // Add selected class to clicked chip
    event.target.classList.add("selected")

    // Set username in input
    const usernameInput = document.getElementById("friendUsername")
    if (usernameInput) {
        usernameInput.value = username
    }
    selectedFriend = username

    // Success notification
    showNotification(`✅ ${username} tanlandi!`, "success")
}

function handleDuelSubmit(e) {
    e.preventDefault()

    const username = document.getElementById("friendUsername").value.trim()
    const gameMode = document.getElementById("gameMode").value
    const boardSize = document.getElementById("boardSize").value
    const duelStatus = document.getElementById("duelStatus")

    if (!username.startsWith("@")) {
        duelStatus.classList.remove("d-none", "alert-success")
        duelStatus.classList.add("alert-danger")
        duelStatus.innerText = 'Iltimos, username boshida "@" belgisi bilan bo\'lsin!'
        return
    }

    // Game mode names
    const gameModeNames = {
        simple: "Simple",
        changeable: "Changeable",
        super: "Super",
    }

    // Success message
    duelStatus.classList.remove("d-none", "alert-danger")
    duelStatus.classList.add("alert-success")
    duelStatus.innerHTML = `✅ Duel <strong>${username}</strong> foydalanuvchiga yuborildi! <br>Mode: <strong>${gameModeNames[gameMode]}</strong>, Board: <strong>${boardSize}</strong>`

    // Add to sent duels
    addSentDuel(username, gameMode, boardSize)

    // Clear form
    document.getElementById("friendUsername").value = ""
    document.getElementById("gameMode").value = "simple"
    document.getElementById("boardSize").value = "3x3"

    // Clear selected friend chip
    document.querySelectorAll(".friend-chip-compact").forEach((chip) => {
        chip.classList.remove("selected")
    })
    selectedFriend = null

    // Hide status after 3 seconds
    setTimeout(() => {
        duelStatus.classList.add("d-none")
    }, 3000)
}

function addSentDuel(username, gameMode, boardSize) {
    const sentDuels = document.getElementById("sentDuels")
    if (!sentDuels) return

    const gameModeNames = {
        simple: "Simple",
        changeable: "Changeable",
        super: "Super",
    }

    const modeClasses = {
        simple: "mode-simple",
        changeable: "mode-changeable",
        super: "mode-super",
    }

    const duelItem = document.createElement("div")
    duelItem.className = "duel-card pending"
    duelItem.innerHTML = `
        <div class="duel-header">
            <div class="duel-user">
                <i class="fas fa-user-circle me-2"></i>
                <strong>${username}</strong>
            </div>
            <div class="duel-badges">
                <span class="mode-badge ${modeClasses[gameMode]}">${gameModeNames[gameMode]}</span>
                <span class="board-badge">${boardSize}</span>
            </div>
        </div>
        <div class="duel-time">
            <i class="fas fa-hourglass-half me-1"></i>
            Javob kutilmoqda...
        </div>
        <div class="duel-actions">
            <button class="btn-action btn-cancel" onclick="cancelDuel('${username}')">
                <i class="fas fa-times"></i>
                Bekor qilish
            </button>
        </div>
    `
    sentDuels.appendChild(duelItem)
    updateSentCount()
}

function acceptDuel(username, gameMode, boardSize) {
    // Remove duel from received list
    const notifications = document.getElementById("duelNotifications")
    if (notifications) {
        const duelItems = notifications.querySelectorAll(".duel-card")
        duelItems.forEach((item) => {
            if (item.innerHTML.includes(username)) {
                item.remove()
            }
        })
    }

    // Update count
    updateReceivedCount()

    // Start appropriate game based on mode
    if (gameMode === "super") {
        startSuperGame(username, gameMode, boardSize)
        showNotification(`👑 ${username} bilan Super o'yin boshlandi!`, "success")
    } else {
        startGame(username, gameMode, boardSize)
        showNotification(`✅ ${username} bilan o'yin boshlandi!`, "success")
    }
}

function rejectDuel(username) {
    // Remove duel from received list
    const notifications = document.getElementById("duelNotifications")
    if (notifications) {
        const duelItems = notifications.querySelectorAll(".duel-card")
        duelItems.forEach((item) => {
            if (item.innerHTML.includes(username)) {
                item.remove()
            }
        })
    }

    // Update count
    updateReceivedCount()

    // Rejection notification
    showNotification(`❌ ${username} dan kelgan duel rad etildi`, "warning")
}

function cancelDuel(username) {
    // Remove duel from sent list
    const sentDuels = document.getElementById("sentDuels")
    if (sentDuels) {
        const duelItems = sentDuels.querySelectorAll(".duel-card")
        duelItems.forEach((item) => {
            if (item.innerHTML.includes(username)) {
                item.remove()
            }
        })
    }

    // Update count
    updateSentCount()

    // Cancellation notification
    showNotification(`🚫 ${username} ga yuborilgan duel bekor qilindi`, "warning")
}

function showGameReady(username, gameMode, boardSize) {
    const gameReadySection = document.getElementById("gameReadySection")
    const gameOpponent = document.getElementById("gameOpponent")
    const gameBoard = document.getElementById("gameBoard")
    const gameModeDisplay = document.getElementById("gameModeDisplay")

    if (!gameReadySection) return

    const gameModeNames = {
        simple: "Simple",
        changeable: "Changeable",
        super: "Super",
    }

    const modeClasses = {
        simple: "mode-simple",
        changeable: "mode-changeable",
        super: "mode-super",
    }

    if (gameOpponent) gameOpponent.textContent = username
    if (gameBoard) gameBoard.textContent = boardSize
    if (gameModeDisplay) {
        gameModeDisplay.textContent = gameModeNames[gameMode]
        gameModeDisplay.className = `mode-badge ${modeClasses[gameMode]}`
    }

    gameReadySection.classList.remove("d-none")

    // Auto hide after 15 seconds
    setTimeout(() => {
        gameReadySection.classList.add("d-none")
    }, 15000)
}

function joinGame() {
    const gameOpponent = document.getElementById("gameOpponent")
    const gameBoard = document.getElementById("gameBoard")
    const gameModeDisplay = document.getElementById("gameModeDisplay")

    if (!gameOpponent || !gameBoard || !gameModeDisplay) return

    const opponent = gameOpponent.textContent
    const board = gameBoard.textContent
    const mode = gameModeDisplay.textContent

    // Hide game ready section
    document.getElementById("gameReadySection").classList.add("d-none")

    // Start game
    startGame(opponent, mode.toLowerCase(), board)

    // Game start notification
    showNotification(`🎮 ${opponent} bilan ${mode} ${board} o'yini boshlandi!`, "primary")
}

function updateSentCount() {
    const sentDuels = document.getElementById("sentDuels")
    const sentCount = document.getElementById("sentCount")
    if (sentDuels && sentCount) {
        const count = sentDuels.querySelectorAll(".duel-card").length
        sentCount.textContent = count
    }
}

function updateReceivedCount() {
    const receivedDuels = document.getElementById("duelNotifications")
    const duelCount = document.getElementById("duelCount")
    if (receivedDuels && duelCount) {
        const count = receivedDuels.querySelectorAll(".duel-card").length
        duelCount.textContent = count
    }
}

// Profile Page Functions
function initializeProfilePage() {
    // Initialize Telegram integration
    if (window.initTelegramApp) {
        window.initTelegramApp()
    }
}

function refreshTelegramData() {
    // Check if Telegram WebApp is available
    const tg = window.Telegram?.WebApp

    if (tg && tg.initDataUnsafe?.user) {
        // Update profile with fresh data
        if (window.updateUserProfile) {
            window.updateUserProfile(tg.initDataUnsafe.user)
        }
        showNotification("✅ Ma'lumotlar yangilandi!", "success")
    } else {
        // Load demo data if Telegram is not available
        const demoUser = {
            first_name: "Demo",
            last_name: "User",
            username: "demo_user",
            id: "123456789",
            language_code: "uz",
            is_premium: false,
        }

        if (window.updateUserProfile) {
            window.updateUserProfile(demoUser)
        }
        showNotification("✅ Demo ma'lumotlar yangilandi!", "info")
    }
}

// Utility Functions
function showNotification(message, type = "info") {
    const notification = document.createElement("div")
    notification.className = `alert alert-${type} position-fixed`
    notification.style.cssText = `
        top: 80px;
        right: 20px;
        z-index: 9999;
        min-width: 300px;
        animation: slideIn 0.3s ease;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    `
    notification.innerHTML = `
        ${message}
        <button type="button" class="btn-close float-end" onclick="this.parentElement.remove()"></button>
    `

    document.body.appendChild(notification)

    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove()
        }
    }, 5000)
}

function logout() {
    if (confirm("Rostdan ham chiqishni xohlaysizmi?")) {
        alert("Muvaffaqiyatli chiqildi!")
        showPage("dashboard")
    }
}

// Event Listeners
document.addEventListener("DOMContentLoaded", () => {
    console.log("⚡ XO Game initialized!")

    // Load default page
    loadPage("dashboard")

    // Touch events
    let touchStartX = 0

    document.addEventListener(
        "touchstart",
        (event) => {
            touchStartX = event.changedTouches[0].screenX
        },
        { passive: true },
    )

    document.addEventListener(
        "touchend",
        (event) => {
            const touchEndX = event.changedTouches[0].screenX
            const diffX = touchStartX - touchEndX

            if (Math.abs(diffX) > 80) {
                if (diffX > 0) {
                    closeSidebars()
                } else {
                    if (!document.getElementById("mainSidebar").classList.contains("active")) {
                        toggleSidebar()
                    }
                }
            }
        },
        { passive: true },
    )

    // Click outside to close
    document.addEventListener("click", (event) => {
        const sidebar = document.getElementById("mainSidebar")
        const hamburgerBtn = document.querySelector(".hamburger-btn")

        if (
            !sidebar.contains(event.target) &&
            !hamburgerBtn.contains(event.target) &&
            sidebar.classList.contains("active")
        ) {
            closeSidebars()
        }
    })

    // Keyboard support
    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") {
            closeSidebars()
        }
    })
})
