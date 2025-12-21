/*script per l'header*/
function injectHeader() {
    const placeholder = document.getElementById("header-placeholder");
    if (!placeholder) {
        console.error("Errore: Elemento #header-placeholder non trovato!");
        return;
    }

    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user") || "null");
    const path = window.location.pathname;

    // Funzione per gestire lo stato attivo dei link
    const isActive = (p) => path.includes(p) ? 'active' : '';

    placeholder.innerHTML = `
        <header class="main-header" id="dynamic-header">
            <div class="header-logo">
                <a href="HomePage.html">FastFood🍋</a>
            </div>
            <nav class="header-nav">
                <ul>
                    <li><a href="HomePage.html" class="${isActive('HomePage')}">Home</a></li>
                    <li><a href="SearchRestaurants.html" class="${isActive('SearchRestaurants')}">Ristoranti</a></li>
                    ${user?.role === 'ristoratore' ? `<li><a href="admin/DashboardRistoratore.html">Dashboard</a></li>` : ''}
                    ${user?.role === 'cliente' ? `<li><a href="ClientOrders.html" class="${isActive('ClientOrders')}">Ordini</a></li>` : ''}
                    <li><a href="Profile.html" class="${isActive('Profile')}">Profilo</a></li>
                </ul>
            </nav>
            <div class="header-auth">
                ${token ?
            `<button class="btn-auth-header" onclick="logout()">Logout</button>` :
            `<a href="LogIn.html" class="btn-auth-header">LogIn/SignUp</a>`
        }
            </div>
        </header>
    `;

    // Effetto allo scroll
    window.addEventListener('scroll', () => {
        const header = document.getElementById('dynamic-header');
        if (header) {
            if (window.scrollY > 30) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        }
    });
}

// Avvia l'iniezione al caricamento del DOM
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectHeader);
} else {
    injectHeader();
}

window.logout = function () {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "LogIn.html";
};