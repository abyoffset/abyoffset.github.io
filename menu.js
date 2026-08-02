// menu.js - Modul Terpusat Tiviku Smart TV
const APP_VERSION = 'v1.2.0';

function applyTheme(themeName) {
    const appWrapper = document.getElementById('app-wrapper');
    const body = document.body;
    
    body.classList.remove('theme-blue-dark', 'theme-red-dark');
    if (appWrapper) appWrapper.classList.remove('theme-blue-dark', 'theme-red-dark'); 

    if (themeName !== 'default') {
        const themeClass = `theme-${themeName}`;
        body.classList.add(themeClass);
        if (appWrapper) appWrapper.classList.add(themeClass);
    }
    
    try {
        localStorage.setItem('currentTheme', themeName);
    } catch (e) {
        console.error("Gagal menyimpan tema:", e);
    }
}

function loadInitialTheme() {
    let savedTheme = 'default';
    try {
        savedTheme = localStorage.getItem('currentTheme') || 'default';
    } catch (e) {
        console.warn("Gagal membaca tema:", e);
    }
    applyTheme(savedTheme);
}

function setupThemeButtons() {
    const themeButtons = document.querySelectorAll('.theme-button');
    themeButtons.forEach(button => {
        button.onclick = () => {
            const theme = button.getAttribute('data-theme');
            applyTheme(theme);
            button.focus(); 
        };
    });
}

function updateClock() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const timeString = `${hours}:${minutes}`;
    const clockElement = document.getElementById('digital-clock');
    if (clockElement) {
        clockElement.innerText = timeString;
    }
}

function initCommonMenu(showPengaturanCallback) {
    loadInitialTheme();
    setupThemeButtons();
    updateClock();
    setInterval(updateClock, 1000);

    const versionInfo = document.getElementById('app-version-info');
    if (versionInfo) {
        versionInfo.innerHTML = `Versi Aplikasi: 2.0 <b>${APP_VERSION}</b>`;
    }

    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            const page = item.getAttribute('data-page');
            if (page === 'beranda') {
                sessionStorage.removeItem('currentCollectionKey');
                sessionStorage.removeItem('currentCollectionTitle');
                sessionStorage.removeItem('comingFromPlayer');
                sessionStorage.removeItem('lastFocusedTitle');
                window.location.href = 'index.html';
            } else if (page === 'koleksi') {
                // Diatur masing-masing halaman
            } else if (page === 'pengaturan') {
                if (typeof showPengaturanCallback === 'function') {
                    showPengaturanCallback();
                }
            }
        });
    });
}
