// Global Variables
let currentPage = "dashboard"
let currentNestedSidebar = null
let activeMenuItem = null
let selectedFriend = null

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
        default:
            break
    }
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

    // Show game ready
    showGameReady(username, gameMode, boardSize)

    // Success notification
    showNotification(`✅ ${username} bilan o'yin qabul qilindi!`, "success")
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

    // Game start notification
    showNotification(`🎮 ${opponent} bilan ${mode} ${board} o'yini boshlanmoqda...`, "primary")

    // Game start simulation
    setTimeout(() => {
        alert(`O'yin boshlanadi!\nRaqib: ${opponent}\nMode: ${mode}\nBoard: ${board}`)
    }, 1000)
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
