const AuthPage = {
    render: () => `
        <div class="row justify-content-center">
            <div class="col-md-6">
                <h2 class="text-center">Login</h2>
                <form id="login-form">
                    <div class="mb-3">
                        <label for="login-email" class="form-label">Email address</label>
                        <input type="email" class="form-control" id="login-email" required>
                    </div>
                    <div class="mb-3">
                        <label for="login-password" class="form-label">Password</label>
                        <input type="password" class="form-control" id="login-password" required>
                    </div>
                    <button type="submit" class="btn btn-primary w-100">Login</button>
                </form>
                <hr/>
                <h2 class="text-center mt-4">Register</h2>
                <form id="register-form">
                    <div class="mb-3">
                        <label for="register-username" class="form-label">Username</label>
                        <input type="text" class="form-control" id="register-username" required>
                    </div>
                    <div class="mb-3">
                        <label for="register-email" class="form-label">Email address</label>
                        <input type="email" class="form-control" id="register-email" required>
                    </div>
                    <div class="mb-3">
                        <label for="register-password" class="form-label">Password</label>
                        <input type="password" class="form-control" id="register-password" required>
                    </div>
                    <div class="mb-3">
                        <label for="register-favorite" class="form-label">Favorite Character</label>
                        <input type="text" class="form-control" id="register-favorite" placeholder="e.g., Harry Potter" required>
                    </div>
                    <button type="submit" class="btn btn-success w-100">Register</button>
                </form>
            </div>
        </div>
    `,
    addEventListeners: () => {
        document.getElementById('login-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('login-email').value;
            const password = document.getElementById('login-password').value;
            try {
                const data = await loginUser({ email, password });
                setToken(data.token);
                showToast('Login successful!');
                navigateTo('/album');
            } catch (err) {
                console.error('Login error:', err);
                showToast('Login failed. Please check your credentials and try again.');
            }
        });

        document.getElementById('register-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const userData = {
                username: document.getElementById('register-username').value,
                email: document.getElementById('register-email').value,
                password: document.getElementById('register-password').value,
                favoriteSuperhero: document.getElementById('register-favorite').value,
            };
            try {
                const data = await registerUser(userData);
                setToken(data.token);
                showToast('Registration successful! Welcome.');
                navigateTo('/album');
            } catch (err) {
                console.error('Registration error:', err);
                showToast('Registration failed. Please check your details and try again.');
            }
        });
    }
};