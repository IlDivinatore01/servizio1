const appRoot = document.getElementById('app-root');
const navbarContainer = document.getElementById('navbar-container');

// Define the routes
const routes = {
    '/': { page: AlbumPage, requiresAuth: true, defaultGuest: '/login' },
    '/login': { page: AuthPage, requiresAuth: false },
    '/album': { page: AlbumPage, requiresAuth: true },
    '/shop': { page: ShopPage, requiresAuth: true },
    '/trades': { page: TradesPage, requiresAuth: true },
};

// The router function
const router = async () => {
    const path = window.location.pathname;
    const isAuthenticated = !!getToken();

    // Find the matching route
    let route = routes[path] || routes['/']; 
    
    // Redirect if auth requirements are not met
    if (route.requiresAuth && !isAuthenticated) {
        navigateTo(route.defaultGuest || '/login');
        return;
    }
    if (!route.requiresAuth && isAuthenticated && path === '/login') {
        navigateTo('/album');
        return;
    }
    
    // Fallback for guest trying to access authenticated root
    if (path === '/' && !isAuthenticated) {
        route = routes['/login'];
    }

    // Render the page
    if (appRoot && route.page) {
        // Show a loading spinner or message
        appRoot.innerHTML = '<div class="text-center"><div class="spinner-border" role="status"><span class="visually-hidden">Loading...</span></div></div>';
        appRoot.innerHTML = await route.page.render();
        if (route.page.addEventListeners) {
            route.page.addEventListeners();
        }
    }

    // Always re-render the navbar to reflect auth state
    if (navbarContainer) {
        navbarContainer.innerHTML = Navbar.render();
        Navbar.addEventListeners();
    }
};

// Listen to navigation events
window.addEventListener('popstate', router);
window.addEventListener('DOMContentLoaded', router);