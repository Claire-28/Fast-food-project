/**
 * HeaderFunctions.js
 * Gestisce l'iniezione dinamica dell'header e la coerenza visiva dei pulsanti.
 */

document.addEventListener('DOMContentLoaded', () => {
    initHeader();
});

function initHeader() {
    const headerPlaceholder = document.getElementById('header-placeholder');
    if (!headerPlaceholder) return;

    // Recuperiamo i dati dell'utente dal localStorage
    const token = localStorage.getItem('token');
    const userString = localStorage.getItem('user');
    let user = null;

    try {
        user = userString ? JSON.parse(userString) : null;
    } catch (e) {
        console.error("Errore nel parsing dell'utente", e);
    }

    let authSection = '';

    if (token && user) {
        // UTENTE LOGGATO
        const profileLink = user.role === 'ristoratore'
            ? 'admin/DashboardRistoratore.html'
            : 'Profile.html';

        authSection = `
            <div class="header-auth">
                <a href="${profileLink}" class="header-nav-link" style="margin-right: 15px; color: white; font-weight: 700; text-decoration: none;">Area Personale</a>
                <button onclick="logout()" class="btn-auth-header">Esci</button>
            </div>
        `;
    } else {
        // UTENTE NON LOGGATO
        authSection = `
            <div class="header-auth" style="display: flex; gap: 10px; align-items: center;">
                <a href="LogIn.html" class="btn-auth-header">Accedi</a>
                <a href="SignUp.html" class="btn-auth-header">Registrati</a>
            </div>
        `;
    }

    // Iniezione dell'HTML dell'header
    headerPlaceholder.innerHTML = `
        <header class="main-header" id="main-header">
            <div class="header-logo">
                <a href="HomePage.html">
                    <span>🍋</span> FastFood
                </a>
            </div>
            
            <nav class="header-nav">
                <ul>
                    <li><a href="HomePage.html">Home</a></li>
                    <li><a href="SearchRestaurants.html">Ristoranti</a></li>
                    <li><a href="Piatti.html">Piatti</a></li>
                </ul>
            </nav>

            ${authSection}
        </header>
    `;

    // Gestione dello scroll
    const handleScroll = () => {
        const header = document.getElementById('main-header');
        if (header) {
            if (window.scrollY > 50) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Controllo iniziale se la pagina è già scrollata
}

/**
 * Funzione di Logout
 */
function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = 'HomePage.html';
}