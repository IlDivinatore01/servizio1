const HomePage = {
    render: () => {
        return `
            <div class="container text-center mt-5">
                <h1>Welcome to the Sticker Album App</h1>
                <p class="lead">Your place to collect and trade virtual stickers!</p>
                <div class="mt-4">
                    <a href="#/login" class="btn btn-primary btn-lg me-2">Login</a>
                    <a href="#/register" class="btn btn-secondary btn-lg">Register</a>
                </div>
            </div>
        `;
    },
    addEventListeners: () => {}
};
