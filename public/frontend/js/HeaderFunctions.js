
/*script per l'header*/
document.addEventListener("DOMContentLoaded", () => {
    const headerPlaceholder = document.getElementById("header-placeholder");

    if (headerPlaceholder) {
        const token = localStorage.getItem("token");
        const user = JSON.parse(localStorage.getItem("user") || "null");
        const currentPath = window.location.pathname;

        const isActive = (path) => currentPath.includes(path) ? 'active' : '';

        const headerHTML = `
            <header class="main-header" id="dynamic-header">
                <div class="header-logo">
                    <a href="HomePage.html">
                        FastFood🍋
                    </a>
                </div>
                <nav class="header-nav">
                    <ul>
                        <li><a href="HomePage.html" class="${isActive('HomePage')}">Home</a></li>
                        <li><a href="SearchRestaurants.html" class="${isActive('SearchRestaurants')}">Ristoranti</a></li>
                        ${user && user.role === 'ristoratore' ? `<li><a href="admin/DashboardRistoratore.html">Dashboard</a></li>` : ''}
                        ${user && user.role === 'cliente' ? `<li><a href="ClientOrders.html" class="${isActive('ClientOrders')}">Ordini</a></li>` : ''}
                        <li><a href="Profile.html" class="${isActive('Profile')}">Profilo</a></li>
                    </ul>
                </nav>
                <div class="header-auth">
                    ${token ?
                `<button class="btn-candy btn-logout" onclick="logout()">Logout</button>` :
                `<a href="LogIn.html" class="btn-candy btn-login">LogIn/SignUp</a>`
            }
                </div>
            </header>
        `;


        headerPlaceholder.innerHTML = headerHTML;

        // Effetto allo scroll per rendere l'header ancora più dinamico
        window.addEventListener('scroll', () => {
            const header = document.getElementById('dynamic-header');
            if (window.scrollY > 50) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        });
    }
});

window.logout = function () {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "LogIn.html";
};