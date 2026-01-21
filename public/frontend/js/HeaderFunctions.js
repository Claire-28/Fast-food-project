/**
 * Ripristino dell'Header originale con logica Dashboard per Ristoratore
 */
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

    // 2. Controllo Login tramite API o LocalStorage
    let isLoggedIn = false;
    let user = null;
    let role = null;

    if (typeof API !== 'undefined' && API.isLoggedIn()) {
        isLoggedIn = true;
        user = API.getUser();
    } else {
        const token = localStorage.getItem('token');
        const userStr = localStorage.getItem('user');
        if (token && userStr) {
            isLoggedIn = true;
            user = JSON.parse(userStr);
        }
    }

    // Estrazione Ruolo (Sincronizzata con lo schema User.js: 'ruolo')
    if (user) {
        role = user.ruolo || user.role || null;
    }

    // 3. HTML CON STRUTTURA CSS ORIGINALE (Per non "sminchiarlo")
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
                
                <!-- Link Dashboard visibile solo se il ruolo nel DB è Ristoratore -->
                ${(role && role.toLowerCase() === 'ristoratore')
            ? `<li><a href="${basePath}admin/DashboardRistoratore.html" style="color: #f1c40f; font-weight: 800;">Dashboard</a></li>`
            : ''}
            </ul>
        </nav>

        <div class="header-auth" id="authButtons" style="display: flex; align-items: center; gap: 15px;">
            <a href="${basePath}CheckOut.html" style="position: relative; color: inherit; text-decoration: none; font-size: 1.2rem;">
                🛒
                <span id="cart-count" style="position: absolute; top: -8px; right: -8px; background: red; color: white; border-radius: 50%; padding: 2px 6px; font-size: 0.7rem; font-weight: bold;">0</span>
            </a>

            ${isLoggedIn
            ? `
                <div style="display: flex; align-items: center; gap: 10px;">
                    <a href="${basePath}Profile.html" style="text-decoration: none; color: inherit; font-weight: bold;">
                        👤 ${user.username || user.name || 'Profilo'}
                    </a>
                    <a href="#" id="logout-btn" style="color: #ff7675; text-decoration: none; font-size: 0.9rem; font-weight: 600;">Esci</a>
                </div>
                `
            : `
                <a href="${basePath}LogIn.html" class="btn-login" style="text-decoration: none; font-weight: bold; color: inherit;">Accedi</a>
                <a href="${basePath}SignUp.html" class="btn-register" style="text-decoration: none; font-weight: bold; color: #7ed991; border: 1px solid #7ed991; padding: 5px 10px; border-radius: 15px; margin-left: 10px;">Registrati</a>
                `
        }
        </div>
    </header>
    `;

    // 4. Gestione Scroll
    window.addEventListener("scroll", () => {
        const header = document.getElementById("mainHeader");
        if (header && window.scrollY > 50) header.classList.add("scrolled");
        else if (header) header.classList.remove("scrolled");
    });

    // 5. Aggiornamento Badge Carrello
    if (typeof Cart !== 'undefined' && Cart.updateBadge) Cart.updateBadge();

    // 6. Logout
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if (typeof API !== 'undefined') API.logout();
            else {
                localStorage.clear();
                window.location.href = basePath + 'LogIn.html';
            }
        });
    }
}