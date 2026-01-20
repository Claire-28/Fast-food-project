document.addEventListener("DOMContentLoaded", () => {
    loadHeader();
});

function loadHeader() {
    const placeholder = document.getElementById("header-placeholder");
    if (!placeholder) return;

    // Determina se siamo in una sottocartella (es. admin/) per aggiustare i link
    const path = window.location.pathname;
    const isSubFolder = path.includes('/admin/');
    const basePath = isSubFolder ? '../' : '';

    const headerHTML = `
    <header class="main-header" id="mainHeader">
        <div class="header-logo">
            <a href="${basePath}HomePage.html">
                🍋 LemonLime
            </a>
        </div>
        
        <nav class="header-nav">
            <ul>
                <li><a href="${basePath}HomePage.html">Home</a></li>
                <li><a href="${basePath}SearchRestaurants.html">Ristoranti</a></li>
                <li><a href="${basePath}Piatti.html">Piatti</a></li>
            </ul>
        </nav>

        <div class="header-auth" id="authButtons">
            <!-- I bottoni verranno inseriti qui via JS in base al login -->
        </div>
    </header>
    `;

    placeholder.innerHTML = headerHTML;

    // Gestione Scroll (effetto trasparenza/colore)
    window.addEventListener("scroll", () => {
        const header = document.getElementById("mainHeader");
        if (window.scrollY > 50) {
            header.classList.add("scrolled");
        } else {
            header.classList.remove("scrolled");
        }
    });

    // Aggiorna i bottoni Login/Logout
    updateAuthButtons(basePath);
}

function updateAuthButtons(basePath) {
    const authContainer = document.getElementById("authButtons");
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('ruolo');

    if (token) {
        // UTENTE LOGGATO
        let dashboardLink = '#';
        if (role === 'Ristoratore') dashboardLink = isSubFolderCheck() ? 'DashboardRistoratore.html' : 'admin/DashboardRistoratore.html';
        if (role === 'Cliente') dashboardLink = basePath + 'Profile.html'; // O ordini cliente

        authContainer.innerHTML = `
            <a href="${dashboardLink}" class="btn-auth-header" style="margin-right:10px;">
                ${role === 'Ristoratore' ? 'Dashboard 👨‍🍳' : 'Profilo 👤'}
            </a>
            <a href="#" id="logoutBtn" class="btn-auth-header" style="border-color:#ff7675; color:#ff7675;">
                Esci
            </a>
        `;

        // Gestione Logout
        document.getElementById('logoutBtn').addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.clear();
            window.location.href = basePath + 'LogIn.html';
        });

    } else {
        // UTENTE OSPITE
        authContainer.innerHTML = `
            <a href="${basePath}LogIn.html" class="btn-auth-header">Accedi</a>
            <a href="${basePath}SignUp.html" class="btn-auth-header" style="background:var(--white); color:#7ed991; margin-left:10px;">Registrati</a>
        `;
    }
}

// Helper semplice per capire se siamo in admin senza passare basePath ovunque
function isSubFolderCheck() {
    return window.location.pathname.includes('/admin/');
}