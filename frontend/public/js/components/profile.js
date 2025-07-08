const ProfilePage = {
    render: async () => {
        try {
            const response = await getUserProfile();
            const user = response.data; // Extract user data from response
            console.log('User data:', user); // Debug log
            
            return `
                <div class="row justify-content-center">
                    <div class="col-md-8">
                        <h2 class="text-center mb-4">My Profile</h2>
                        <div class="card">
                            <div class="card-body">
                                <div class="row">
                                    <div class="col-md-6">
                                        <h5 class="card-title">Profile Information</h5>
                                        <div class="card bg-light">
                                            <div class="card-body">
                                                <div class="d-flex justify-content-between mb-2">
                                                    <span><strong>Username:</strong></span>
                                                    <span>${user.username || 'Not set'}</span>
                                                </div>
                                                <div class="d-flex justify-content-between mb-2">
                                                    <span><strong>Email:</strong></span>
                                                    <span>${user.email || 'Not set'}</span>
                                                </div>
                                                <div class="d-flex justify-content-between mb-2">
                                                    <span><strong>Favorite Character:</strong></span>
                                                    <span>${user.favoriteSuperhero || 'Not set'}</span>
                                                </div>
                                                <div class="d-flex justify-content-between mb-2">
                                                    <span><strong>User Type:</strong></span>
                                                    <span class="badge ${user.role === 'admin' ? 'bg-danger' : 'bg-secondary'}">${user.role === 'admin' ? 'Admin' : 'User'}</span>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <form id="profile-form" class="mt-3">
                                            <div class="mb-3">
                                                <label for="profile-favorite" class="form-label">Update Favorite Character</label>
                                                <input type="text" class="form-control" id="profile-favorite" value="" placeholder="Type your favorite Harry Potter character (e.g., Harry Potter)" list="profile-character-list" autocomplete="off" />
                                                <datalist id="profile-character-list"></datalist>
                                            </div>
                                            <button type="submit" class="btn btn-primary">Update Favorite Character</button>
                                        </form>
                                        ${user.role !== 'admin' ? `
                                            <form id="upgrade-admin-form" class="mt-3">
                                                <div class="mb-3">
                                                    <label for="admin-password" class="form-label">Become Admin (enter admin password)</label>
                                                    <input type="password" class="form-control" id="admin-password" placeholder="Admin password" required />
                                                </div>
                                                <button type="submit" class="btn btn-danger">Upgrade to Admin</button>
                                            </form>
                                        ` : `
                                            <button id="downgrade-admin-btn" class="btn btn-warning mt-3">Downgrade to User</button>
                                        `}
                                    </div>
                                    <div class="col-md-6">
                                        <h5 class="card-title">Account Statistics</h5>
                                        <div class="card bg-light">
                                            <div class="card-body">
                                                <div class="d-flex justify-content-between mb-2">
                                                    <span>Credits:</span>
                                                    <span class="badge bg-success">${Math.floor(user.credits) || 0}</span>
                                                </div>
                                                <div class="d-flex justify-content-between mb-2">
                                                    <span>Total Stickers:</span>
                                                    <span class="badge bg-info">${user.ownedStickers ? user.ownedStickers.length : 0}</span>
                                                </div>
                                                <div class="d-flex justify-content-between mb-2">
                                                    <span>Member Since:</span>
                                                    <span class="text-muted">${user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Unknown'}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div class="card mt-4">
                            <div class="card-body">
                                <h5 class="card-title">Change Password</h5>
                                <form id="password-form">
                                    <div class="mb-3 position-relative">
                                        <label for="current-password" class="form-label">Current Password</label>
                                        <input type="password" class="form-control pr-5" id="current-password" required style="padding-right:2.5rem;">
                                        <button type="button" class="btn btn-sm btn-outline-secondary password-toggle position-absolute top-50 end-0 translate-middle-y me-2" tabindex="-1" id="toggle-current-password" style="right:0.5rem; z-index:2;"><i class="fas fa-eye"></i></button>
                                    </div>
                                    <div class="mb-3 position-relative">
                                        <label for="new-password" class="form-label">New Password</label>
                                        <input type="password" class="form-control pr-5" id="new-password" required style="padding-right:2.5rem;">
                                        <button type="button" class="btn btn-sm btn-outline-secondary password-toggle position-absolute top-50 end-0 translate-middle-y me-2" tabindex="-1" id="toggle-new-password" style="right:0.5rem; z-index:2;"><i class="fas fa-eye"></i></button>
                                    </div>
                                    <div class="mb-3 position-relative">
                                        <label for="confirm-password" class="form-label">Confirm New Password</label>
                                        <input type="password" class="form-control pr-5" id="confirm-password" required style="padding-right:2.5rem;">
                                        <button type="button" class="btn btn-sm btn-outline-secondary password-toggle position-absolute top-50 end-0 translate-middle-y me-2" tabindex="-1" id="toggle-confirm-password" style="right:0.5rem; z-index:2;"><i class="fas fa-eye"></i></button>
                                    </div>
                                    <button type="submit" class="btn btn-warning">Change Password</button>
                                </form>
                            </div>
                        </div>
                        <!-- Delete Profile Section -->
                        <div class="card mt-4">
                            <div class="card-body">
                                <h5 class="card-title text-danger">Danger Zone</h5>
                                <button id="delete-profile-btn" class="btn btn-outline-danger w-100">Delete My Profile</button>
                                <div class="form-text text-danger mt-2">This will permanently delete your account, all stickers, and all trades. This action cannot be undone.</div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        } catch (error) {
            console.error('Error loading profile:', error);
            return `
                <div class="alert alert-danger" role="alert">
                    <h4 class="alert-heading">Error Loading Profile</h4>
                    <p>Unable to load your profile information. Please try again later.</p>
                </div>
            `;
        }
    },
    
    addEventListeners: () => {
        // --- Autocomplete for favorite character in profile ---
        let validCharacterNames = [];
        async function fetchCharacterNames() {
            try {
                // Use the centralized API function
                const data = await getCharacterNamesList(); 
                console.log('Parsed character names data:', data);

                if (Array.isArray(data)) {
                    return data.filter(Boolean); // Filter out any null/empty names
                }
                console.warn('Received non-array data for character names:', data);
                return [];
            } catch (err) {
                console.error('Failed to fetch or parse character names:', err);
                return [];
            }
        }

        fetchCharacterNames().then(names => {
            validCharacterNames = names;
            console.log('Populated validCharacterNames:', validCharacterNames); // Log the final array
            const datalist = document.getElementById('profile-character-list');
            if (datalist && names.length) {
                datalist.innerHTML = names.map(name => `<option value="${name}"></option>`).join('');
            }
        });
        // Profile update form
        const profileForm = document.getElementById('profile-form');
        if (profileForm) {
            profileForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const favorite = document.getElementById('profile-favorite').value.trim();
                if (!favorite) {
                    showToast('Favorite character cannot be empty!', 'warning');
                    return;
                }
                if (!validCharacterNames.includes(favorite)) {
                    showToast('Please select a valid character from the list.', 'warning');
                    return;
                }
                const profileData = {
                    favoriteSuperhero: favorite,
                };
                try {
                    const response = await updateUserProfile(profileData);
                    console.log('Profile update response:', response); // Debug log
                    showToast('Favorite character updated successfully!', 'success');
                    // Refresh the page to show updated data
                    setTimeout(() => {
                        window.location.hash = '/profile';
                    }, 1000);
                } catch (error) {
                    console.error('Profile update error:', error);
                    showToast('Failed to update favorite character. Please try again.', 'danger');
                }
            });
        }
        
        // Password change form
        const passwordForm = document.getElementById('password-form');
        if (passwordForm) {
            passwordForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                
                const currentPassword = document.getElementById('current-password').value;
                const newPassword = document.getElementById('new-password').value;
                const confirmPassword = document.getElementById('confirm-password').value;
                
                if (newPassword !== confirmPassword) {
                    showToast('New passwords do not match!', 'danger');
                    return;
                }
                
                if (newPassword.length < 6) {
                    showToast('Password must be at least 6 characters long!', 'danger');
                    return;
                }
                
                try {
                    const response = await updateUserPassword({
                        currentPassword,
                        newPassword
                    });
                    console.log('Password update response:', response); // Debug log
                    showToast('Password changed successfully!', 'success');
                    // Clear the form
                    passwordForm.reset();
                } catch (error) {
                    console.error('Password change error:', error);
                    showToast('Failed to change password. Please check your current password.', 'danger');
                }
            });
        }
        
        // Admin upgrade
        const upgradeForm = document.getElementById('upgrade-admin-form');
        if (upgradeForm) {
            upgradeForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const adminPassword = document.getElementById('admin-password').value;
                if (!adminPassword) return showToast('Admin password required', 'warning');
                try {
                    await upgradeToAdmin(adminPassword);
                    showToast('You are now an admin!', 'success');
                    setTimeout(() => { window.location.reload(); }, 1000);
                } catch (err) {
                    console.error('Admin upgrade error:', err);
                    showToast('Incorrect admin password', 'danger');
                }
            });
        }
        // Admin downgrade
        const downgradeBtn = document.getElementById('downgrade-admin-btn');
        if (downgradeBtn) {
            downgradeBtn.addEventListener('click', async () => {
                const confirmed = await showConfirmModal('Are you sure you want to downgrade to a normal user?');
                if (!confirmed) return;
                try {
                    await downgradeToUser();
                    showToast('You are now a normal user.', 'success');
                    setTimeout(() => { window.location.reload(); }, 1000);
                } catch (err) {
                    console.error('Admin downgrade error:', err);
                    showToast('Failed to downgrade.', 'danger');
                }
            });
        }

        // --- Password visibility toggle (single function, consistent with register/login) ---
        function setupPasswordToggle(inputId, btnId) {
            const input = document.getElementById(inputId);
            const btn = document.getElementById(btnId);
            if (input && btn) {
                btn.addEventListener('click', () => {
                    const isPassword = input.type === 'password';
                    input.type = isPassword ? 'text' : 'password';
                    const icon = btn.querySelector('i');
                    if (icon) {
                        icon.classList.toggle('fa-eye', !isPassword);
                        icon.classList.toggle('fa-eye-slash', isPassword);
                    }
                });
            }
        }
        setupPasswordToggle('current-password', 'toggle-current-password');
        setupPasswordToggle('new-password', 'toggle-new-password');
        setupPasswordToggle('confirm-password', 'toggle-confirm-password');

        // Delete Profile logic
        const deleteBtn = document.getElementById('delete-profile-btn');
        if (deleteBtn) {
            deleteBtn.addEventListener('click', async () => {
                // Show a modal to ask for password
                const password = await showPasswordPromptModal('To delete your profile, please enter your password:');
                if (!password) return;
                const confirmed = await showConfirmModal('Are you absolutely sure? This will permanently delete your account, all stickers, and all trades. This action cannot be undone.', 'Delete Forever', 'Cancel');
                if (!confirmed) return;
                try {
                    await deleteUserProfile(password);
                    showToast('Your account has been deleted. Goodbye!', 'success');
                    // Remove token and redirect to home (force reload, clear hash)
                    localStorage.removeItem('token');
                    setTimeout(() => {
                        window.location.hash = '';
                        window.location.replace('/');
                    }, 1500);
                } catch (err) {
                    showToast(err.message || 'Failed to delete account. Please check your password.', 'danger');
                }
            });
        }

        // Helper: Show a modal to prompt for password
        async function showPasswordPromptModal(message) {
            return new Promise((resolve) => {
                let modal = document.getElementById('site-password-modal');
                if (!modal) {
                    modal = document.createElement('div');
                    modal.id = 'site-password-modal';
                    modal.innerHTML = `
                    <div class="modal fade" tabindex="-1" id="site-password-modal" aria-hidden="true">
                      <div class="modal-dialog modal-dialog-centered">
                        <div class="modal-content">
                          <div class="modal-header">
                            <h5 class="modal-title">Password Required</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                          </div>
                          <div class="modal-body">
                            <p>${message}</p>
                            <input type="password" class="form-control" id="site-password-modal-input" placeholder="Enter your password" autocomplete="current-password" />
                          </div>
                          <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" id="site-password-cancel">Cancel</button>
                            <button type="button" class="btn btn-danger" id="site-password-ok">Delete</button>
                          </div>
                        </div>
                      </div>
                    </div>`;
                    document.body.appendChild(modal);
                }
                const input = modal.querySelector('#site-password-modal-input');
                input.value = '';
                // Show modal (Bootstrap 5)
                const bsModal = new bootstrap.Modal(modal.querySelector('.modal'));
                bsModal.show();
                // Cleanup old listeners
                const okBtn = modal.querySelector('#site-password-ok');
                const cancelBtn = modal.querySelector('#site-password-cancel');
                const closeBtn = modal.querySelector('.btn-close');
                const cleanup = () => {
                    okBtn.removeEventListener('click', onOk);
                    cancelBtn.removeEventListener('click', onCancel);
                    if (closeBtn) closeBtn.removeEventListener('click', onCancel);
                };
                function onOk() {
                    cleanup();
                    bsModal.hide();
                    resolve(input.value);
                }
                function onCancel() {
                    cleanup();
                    bsModal.hide();
                    resolve(null);
                }
                okBtn.addEventListener('click', onOk);
                cancelBtn.addEventListener('click', onCancel);
                if (closeBtn) closeBtn.addEventListener('click', onCancel);
                // Enter key submits
                input.addEventListener('keydown', function(e) {
                    if (e.key === 'Enter') {
                        onOk();
                    }
                });
                // Also handle modal dismissal (e.g., clicking backdrop)
                modal.querySelector('.modal').addEventListener('hidden.bs.modal', () => {
                    cleanup();
                    resolve(null);
                }, { once: true });
                setTimeout(() => input.focus(), 200);
            });
        }
    }
};
