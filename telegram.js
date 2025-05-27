// Telegram WebApp Integration
let tg = window.Telegram?.WebApp;
let user = null;

// Declare showNotification function
function showNotification(message, type) {
    console.log(`Notification (${type}): ${message}`);
}

// Initialize Telegram WebApp
function initTelegramApp() {
    if (tg) {
        tg.ready();
        user = tg.initDataUnsafe?.user;

        if (user) {
            updateUserProfile(user);
            console.log('Telegram user loaded:', user);
        } else {
            console.log('Telegram user not available, using demo data');
            loadDemoUserData();
        }

        // Set theme
        if (tg.themeParams) {
            updateThemeFromTelegram(tg.themeParams);
        }
    } else {
        console.log('Telegram WebApp not available, using demo data');
        loadDemoUserData();
    }
}

// Update user profile with Telegram data
function updateUserProfile(userData) {
    const userName = document.getElementById('userName');
    const userUsername = document.getElementById('userUsername');
    const userAvatar = document.getElementById('userAvatar');
    const telegramId = document.getElementById('telegramId');
    const userLanguage = document.getElementById('userLanguage');
    const premiumStatus = document.getElementById('premiumStatus');

    if (userData) {
        if (userName) {
            userName.textContent = `${userData.first_name} ${userData.last_name || ''}`.trim();
        }
        if (userUsername) {
            userUsername.textContent = userData.username ? `@${userData.username}` : 'Username yo\'q';
        }
        if (telegramId) {
            telegramId.textContent = userData.id;
        }
        if (userLanguage) {
            userLanguage.textContent = `Til: ${userData.language_code?.toUpperCase() || 'Noma\'lum'}`;
        }
        if (premiumStatus) {
            premiumStatus.textContent = userData.is_premium ? 'Premium foydalanuvchi' : 'Oddiy foydalanuvchi';
        }
        if (userAvatar && userData.photo_url) {
            userAvatar.src = userData.photo_url;
        }
    }
}

// Load demo data when Telegram is not available
function loadDemoUserData() {
    const demoUser = {
        first_name: 'Demo',
        last_name: 'User',
        username: 'demo_user',
        id: '123456789',
        language_code: 'uz',
        is_premium: false
    };
    updateUserProfile(demoUser);
}

// Update theme from Telegram
function updateThemeFromTelegram(themeParams) {
    const themeDisplay = document.getElementById('themeParams');
    if (themeDisplay && themeParams.bg_color) {
        themeDisplay.textContent = `Telegram theme: ${themeParams.bg_color}`;
    }
}

// Refresh Telegram data
function refreshTelegramData() {
    if (tg && tg.initDataUnsafe?.user) {
        updateUserProfile(tg.initDataUnsafe.user);
        if (window.showNotification) {
            showNotification('✅ Ma\'lumotlar yangilandi!', 'success');
        }
    } else {
        if (window.showNotification) {
            showNotification('⚠️ Telegram ma\'lumotlari mavjud emas', 'warning');
        }
    }
}

// Export functions for global access
window.initTelegramApp = initTelegramApp;
window.refreshTelegramData = refreshTelegramData;
window.updateUserProfile = updateUserProfile;
window.showNotification = showNotification;
