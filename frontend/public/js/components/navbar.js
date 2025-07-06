const Navbar = {
    render: () => {
        const token = getToken();
        const userLinks = `
            <li class="nav-item">
                <a class="nav-link" href="/album" onclick="navigateTo('/album'); event.preventDefault();">My Album</a>
            </li>
            <li class="nav-item">
                <a class="nav-link" href="/shop" onclick="navigateTo('/shop'); event.preventDefault();">Shop</a>
            </li>
            <li class="nav-item">
                <a class="nav-link" href="/trades" onclick="navigateTo('/trades'); event.preventDefault();">Trade Market</a>
            </li>
            <li class="nav-item">
                <a id="logout-btn" class="nav-link" href="#">Logout</a>
            </li>
        `;
        const guestLinks = `
            <li class="nav-item">
                <a class="nav-link" href="/login" onclick="navigateTo('/login'); event.preventDefault();">Login / Register</a>
            </li>
        `;

        return `
            <div class="container-fluid">
                <a class="navbar-brand" href="/" onclick="navigateTo('/'); event.preventDefault();">AFSE</a>
                <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
                    <span class="navbar-toggler-icon"></span>
                </button>
                <div class="collapse navbar-collapse" id="navbarNav">
                    <ul class="navbar-nav ms-auto">
                        ${token ? userLinks : guestLinks}
                    </ul>
                </div>
            </div>
        `;
    },
    addEventListeners: () => {
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                removeToken();
                navigateTo('/login');
            });
        }
    }
};