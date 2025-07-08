const appRoot = document.getElementById('app-root');
const navbarContainer = document.getElementById('navbar-container');

// Define the routes
const routes = {
    '/': { page: HomePage, requiresAuth: false },
    '/login': { page: LoginPage, requiresAuth: false },
    '/register': { page: RegisterPage, requiresAuth: false },
    '/album': { page: AlbumPage, requiresAuth: true },
    '/shop': { page: ShopPage, requiresAuth: true },
    '/trades': { page: TradesPage, requiresAuth: true },
    '/profile': { page: ProfilePage, requiresAuth: true },
};

// The router function
const router = async () => {
    const path = window.location.hash.slice(1) || '/';
    const isAuthenticated = !!getToken();

    // Find the matching route
    const route = routes[path] || routes['/'];

    // Redirect if auth requirements are not met
    if (route.requiresAuth && !isAuthenticated) {
        navigateTo('/login');
        return;
    }
    if (!route.requiresAuth && isAuthenticated && (path === '/login' || path === '/register' || path === '/')) {
        navigateTo('/album');
        return;
    }

    // Render the page
    if (appRoot && route.page) {
        // Show a loading spinner or message
        appRoot.innerHTML = '<div class="text-center"><div class="spinner-border" role="status"><span class="visually-hidden">Loading...</span></div></div>';
        
        // Use a short timeout to allow the spinner to render before loading the page content
        setTimeout(async () => {
            appRoot.innerHTML = await route.page.render();
            if (route.page.addEventListeners) {
                route.page.addEventListeners();
            }
        }, 50);
    }

    // Always re-render the navbar to reflect auth state
    if (navbarContainer) {
        navbarContainer.innerHTML = Navbar.render();
        Navbar.addEventListeners();
    }
};

// Listen to navigation events
window.addEventListener('hashchange', router);
window.addEventListener('DOMContentLoaded', router);

// Update navigateTo to use hash
window.navigateTo = (path) => {
    window.location.hash = path;
};