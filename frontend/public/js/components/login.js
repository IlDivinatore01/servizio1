const LoginPage = {
    render: () => `
        <div class="row justify-content-center">
            <div class="col-md-6">
                <h2 class="text-center">Login</h2>
                <form id="login-form">
                    <div class="mb-3">
                        <label for="login-email" class="form-label">Email address</label>
                        <input type="email" class="form-control" id="login-email" required>
                    </div>
                    <div class="mb-3 position-relative">
                        <label for="login-password" class="form-label">Password</label>
                        <input type="password" class="form-control pr-5" id="login-password" required style="padding-right:2.5rem;">
                        <button type="button" class="btn btn-sm btn-outline-secondary password-toggle position-absolute top-50 end-0 translate-middle-y me-2" tabindex="-1" id="toggle-login-password" style="right:0.5rem; z-index:2;"><i class="fas fa-eye"></i></button>
                    </div>
                    <button type="submit" class="btn btn-primary w-100">Login</button>
                </form>
                <div class="text-center mt-3">
                    <p>Don't have an account? <a href="#/register">Register here</a></p>
                </div>
            </div>
        </div>
    `,
    addEventListeners: () => {
        document.getElementById('login-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            console.log('Login form submitted');
            const email = document.getElementById('login-email').value;
            const password = document.getElementById('login-password').value;
            console.log('Email:', email, 'Password length:', password.length);
            
            try {
                console.log('Attempting to login...');
                const data = await loginUser({ email, password });
                console.log('Login successful, data:', data);
                setToken(data.token);
                showToast('Login successful!');
                console.log('Setting hash to /album');
                window.location.hash = '/album';
            } catch (err) {
                console.error('Login error:', err);
                showToast('Login failed. Please check your credentials and try again.', 'danger');
            }
        });
        // Password visibility toggle
        const togglePassword = (inputId, btnId) => {
            const input = document.getElementById(inputId);
            const btn = document.getElementById(btnId);
            if (input && btn) {
                btn.addEventListener('click', () => {
                    input.type = input.type === 'password' ? 'text' : 'password';
                    btn.querySelector('i').classList.toggle('fa-eye');
                    btn.querySelector('i').classList.toggle('fa-eye-slash');
                });
            }
        };
        togglePassword('login-password', 'toggle-login-password');
    }
};
