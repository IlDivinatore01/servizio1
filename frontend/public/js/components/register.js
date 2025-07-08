const RegisterPage = {
    render: () => `
        <div class="row justify-content-center">
            <div class="col-md-6">
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
                    <div class="mb-3 position-relative">
                        <label for="register-password" class="form-label">Password</label>
                        <input type="password" class="form-control pr-5" id="register-password" required style="padding-right:2.5rem;">
                        <button type="button" class="btn btn-sm btn-outline-secondary password-toggle position-absolute top-50 end-0 translate-middle-y" tabindex="-1" id="toggle-register-password" style="right:0.75rem; z-index:2;"><i class="fas fa-eye"></i></button>
                    </div>
                    <div class="mb-3 position-relative">
                        <label for="register-password2" class="form-label">Confirm Password</label>
                        <input type="password" class="form-control pr-5" id="register-password2" required style="padding-right:2.5rem;">
                        <button type="button" class="btn btn-sm btn-outline-secondary password-toggle position-absolute top-50 end-0 translate-middle-y" tabindex="-1" id="toggle-register-password2" style="right:0.75rem; z-index:2;"><i class="fas fa-eye"></i></button>
                    </div>
                    <div class="mb-3">
                        <label for="register-favorite" class="form-label">Favorite Character</label>
                        <input type="text" class="form-control" id="register-favorite" placeholder="e.g., Harry Potter" list="character-list" autocomplete="off" required>
                        <datalist id="character-list"></datalist>
                    </div>
                    <button type="submit" class="btn btn-success w-100">Register</button>
                </form>
                <div class="text-center mt-3">
                    <p>Already have an account? <a href="#/login">Login here</a></p>
                </div>
            </div>
        </div>
    `,
    addEventListeners: () => {
        let validCharacterNames = [];
        async function fetchCharacterNames() {
            try {
                // Use the centralized API function
                const data = await getCharacterNamesList();
                console.log('Parsed character names data (register):', data);

                if (Array.isArray(data)) {
                    return data.filter(Boolean);
                }
                console.warn('Received non-array data for character names (register):', data);
                return [];
            } catch (err) {
                console.error('Failed to fetch or parse character names (register):', err);
                return [];
            }
        }
        const favoriteInput = document.getElementById('register-favorite');
        if (favoriteInput) favoriteInput.disabled = true;
        fetchCharacterNames().then(names => {
            validCharacterNames = names;
            const datalist = document.getElementById('character-list');
            if (datalist && names.length) {
                datalist.innerHTML = names.map(name => `<option value="${name}"></option>`).join('');
                if (favoriteInput) favoriteInput.disabled = false;
                console.log('Loaded character names for datalist:', names);
            } else {
                console.warn('No character names loaded for datalist.');
            }
        });

        document.getElementById('register-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const password = document.getElementById('register-password').value;
            const password2 = document.getElementById('register-password2').value;
            const favorite = document.getElementById('register-favorite').value.trim();

            if (password.length < 6) {
                showToast('Password must be at least 6 characters long.', 'warning');
                return;
            }
            if (password !== password2) {
                showToast('Passwords do not match.', 'warning');
                return;
            }
            if (!validCharacterNames.includes(favorite)) {
                showToast('Please select a valid character from the list.', 'warning');
                return;
            }

            const userData = {
                username: document.getElementById('register-username').value,
                email: document.getElementById('register-email').value,
                password: password,
                favoriteSuperhero: favorite,
            };
            try {
                const data = await registerUser(userData);
                setToken(data.token);
                showToast('Registration successful! Welcome.');
                window.location.hash = '/album';
            } catch (err) {
                console.error('Registration error:', err);
                showToast(err?.message || 'Registration failed. Please check your details and try again.', 'danger');
            }
        });
        // Password visibility toggles
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
        togglePassword('register-password', 'toggle-register-password');
        togglePassword('register-password2', 'toggle-register-password2');
    }
};
