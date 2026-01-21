document.addEventListener("DOMContentLoaded", () => {
    loadHeader();
});

function loadHeader() {
    const headerPlaceholder = document.getElementById("header-placeholder");
    if (!headerPlaceholder) return;

    // 1. Logica percorsi relativi
    const path = window.location.pathname;
    const isSubFolder = path.includes('/admin/');
    const basePath = isSubFolder ? '../' : '';

    // 2. Controllo Login
    let isLoggedIn = false;
    let user = null;
    let role = null;

    if (typeof API !== 'undefined' && API.isLoggedIn()) {
        isLoggedIn = true;
        user = API.getUser();
        role = user ? user.role : null;
    } else {
        const token = localStorage.getItem('token');
        if (token) {
            isLoggedIn = true;
            role = localStorage.getItem('role');
            user = { username: 'Utente', role: role };
        }
    }

    // 3. HTML CORRETTO
    headerPlaceholder.innerHTML = `
    <header class="main-header" id="mainHeader">
        <div class="header-logo">
            <a href="${basePath}HomePage.html" style="text-decoration: none; color: inherit;">
                🍋 LemonLime
            </a>
        </div>
        
        <nav class="header-nav">
            <ul>
                <li><a href="${basePath}HomePage.html">Home</a></li>
                <li><a href="${basePath}SearchRestaurants.html">Ristoranti</a></li>
                <li><a href="${basePath}Piatti.html">Menu</a></li>
                ${isLoggedIn ? `<li><a href="${basePath}ClientOrders.html">Ordini</a></li>` : ''}
            </ul>
        </nav>

        <div class="header-auth" id="authButtons" style="display: flex; align-items: center; gap: 15px;">
            <a href="${basePath}CheckOut.html" style="position: relative; color: inherit; text-decoration: none; font-size: 1.2rem;">
                🛒
                <span id="cart-count" style="position: absolute; top: -8px; right: -8px; background: red; color: white; border-radius: 50%; padding: 2px 6px; font-size: 0.7rem; font-weight: bold;">0</span>
            </a>

            ${isLoggedIn
            ? `
                <div class="user-menu-container" style="display: flex; align-items: center; gap: 15px;">
                    ${(role && role.toLowerCase() === 'ristoratore')
                ? `<a href="${basePath}admin/DashboardRistoratore.html" style="background: #f1c40f; color: #2d3436; padding: 6px 12px; border-radius: 20px; text-decoration: none; font-weight: bold; font-size: 0.9rem; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
                        <i class="fas fa-chart-line"></i> Dashboard
                    </a>`
                : ''}

                    <a href="${basePath}Profile.html" style="text-decoration: none; color: inherit; font-weight: bold; display: flex; align-items: center; gap: 5px;">
                        👤 <span class="user-name">${user && user.username ? user.username : 'Profilo'}</span>
                    </a>

                    <a href="#" id="logout-btn" style="color: #ff7675; text-decoration: none; font-size: 0.9rem; border-left: 1px solid #ddd; padding-left: 10px;">
                        <i class="fas fa-sign-out-alt"></i> Esci
                    </a>
                </div>
                `
            : `
                <a href="${basePath}LogIn.html" class="btn-login" style="text-decoration: none; font-weight: bold; color: inherit;">Accedi</a>
                <a href="${basePath}SignUp.html" class="btn-register" style="text-decoration: none; font-weight: bold; color: #000000; border: 1px solid #7ed991; padding: 5px 10px; border-radius: 15px; margin-left: 10px;">Registrati</a>
                `
        }
        </div>
    </header>
    `;

    // ... (il resto del codice per scroll, badge e logout rimane invariato)

    // Inizializzazione logout e badge qui sotto...
    setupHeaderFeatures(basePath);
}

function setupHeaderFeatures(basePath) {
    window.addEventListener("scroll", () => {
        const header = document.getElementById("mainHeader");
        if (header) {
            if (window.scrollY > 50) header.classList.add("scrolled");
            else header.classList.remove("scrolled");
        }
    });

    if (typeof Cart !== 'undefined') Cart.updateBadge();

    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if (typeof API !== 'undefined') API.logout();
            else localStorage.clear();
            window.location.href = basePath + 'LogIn.html';
        });
    }
}