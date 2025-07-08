// Global variables to share between render and addEventListeners
let trades = [], allPossibleStickers = [], user = null;

const TradesPage = {
    render: async () => {
        // We need the user's data for the form and the list of all trades
        try {
            [user, trades] = await Promise.all([
                getUserProfile().then(res => res.data).catch(() => null), // Get user's owned stickers and credits
                getTradeOffers().then(res => res.data).catch(() => []) // Get all public trades
            ]);
            allPossibleStickers = await getAllStickers().then(res => res.data).catch(() => []);

            if (!user) {
                return `<p class="text-danger">You must be logged in to view the trade market.</p>`;
            }

        } catch (error) {
            console.error('Failed to load initial trade data:', error);
            return `<p class="text-danger">Could not load the trade market. Please try again later.</p>`;
        }

        const renderItems = (items) => items.map(item => {
            if (item.isCredit) return `<li>${item.amount} Credits</li>`;
            return `<li>${item.sticker?.name || 'Unknown Sticker'} (x${item.quantity})</li>`;
        }).join('');

        const renderTradeList = (trades, currentUser) => {
            // Filter out trades with missing proposerId
            const publicTrades = trades.filter(trade => trade.proposerId && trade.proposerId._id !== currentUser._id);
            if (publicTrades.length === 0) return '<p class="text-center text-muted">No open trades at the moment.</p>';

            return publicTrades.map(trade => {
                return `
                    <div class="card trade-offer-card mb-3">
                        <div class="card-header">
                            Offer by: <strong>${trade.proposerId.username}</strong>
                        </div>
                        <div class="card-body">
                            <div class="row">
                                <div class="col-6 border-end">
                                    <h6 class="text-success">Offering:</h6>
                                    <ul>${renderItems(trade.proposerItems)}</ul>
                                </div>
                                <div class="col-6">
                                    <h6 class="text-primary">Requesting:</h6>
                                    <ul>${renderItems(trade.requestedItems)}</ul>
                                </div>
                            </div>
                        </div>
                        <div class="card-footer text-end">
                            <button class="btn btn-sm btn-success accept-trade-btn" data-trade-id="${trade._id}">Accept Trade</button>
                        </div>
                    </div>
                `;
            }).join('');
        };

        const renderUserTrades = (trades, currentUser) => {
            // Filter out trades with missing proposerId
            const userTrades = trades.filter(trade => trade.proposerId && trade.proposerId._id === currentUser._id);
            if (userTrades.length === 0) return '<p class="text-center text-muted">You have no active trades.</p>';

            return userTrades.map(trade => `
                <div class="card user-trade-card mb-3">
                    <div class="card-body">
                        <div class="row">
                            <div class="col-6 border-end">
                                <h6 class="text-success">Offering:</h6>
                                <ul>${renderItems(trade.proposerItems)}</ul>
                            </div>
                            <div class="col-6">
                                <h6 class="text-primary">Requesting:</h6>
                                <ul>${renderItems(trade.requestedItems)}</ul>
                            </div>
                        </div>
                    </div>
                    <div class="card-footer text-end">
                        <button class="btn btn-sm btn-danger cancel-trade-btn" data-trade-id="${trade._id}">Cancel Trade</button>
                    </div>
                </div>
            `).join('');
        };


        return `
            <div class="container mt-4">
                <div class="row">
                    <!-- Create Trade Section -->
                    <div class="col-lg-5">
                        <div class="card sticky-top" style="top: 20px;">
                            <div class="card-body">
                                <h3 class="card-title text-center">Create a New Trade</h3>
                                <p class="text-center text-muted small">Select the type of trade you want to make.</p>
                                
                                <!-- Trade Type Selection -->
                                <div class="d-flex justify-content-center mb-3">
                                    <div class="btn-group" role="group" aria-label="Trade Type">
                                        <input type="radio" class="btn-check" name="trade-type" id="trade-type-cards-for-cards" value="cards-for-cards" autocomplete="off" checked>
                                        <label class="btn btn-outline-primary" for="trade-type-cards-for-cards">Cards for Cards</label>

                                        <input type="radio" class="btn-check" name="trade-type" id="trade-type-credits-for-cards" value="credits-for-cards" autocomplete="off">
                                        <label class="btn btn-outline-primary" for="trade-type-credits-for-cards">Credits for Cards</label>

                                        <input type="radio" class="btn-check" name="trade-type" id="trade-type-cards-for-credits" value="cards-for-credits" autocomplete="off">
                                        <label class="btn btn-outline-primary" for="trade-type-cards-for-credits">Cards for Credits</label>
                                    </div>
                                </div>

                                <form id="create-trade-form">
                                    <!-- Offering Section -->
                                    <div id="offering-section" class="mb-3">
                                        <h5 class="text-success">You Offer:</h5>
                                        <!-- Dynamic content will be rendered here by JS -->
                                    </div>

                                    <!-- Requesting Section -->
                                    <div id="requesting-section" class="mt-3">
                                        <h5 class="text-primary">You Request:</h5>
                                        <!-- Dynamic content will be rendered here by JS -->
                                    </div>

                                    <div class="d-grid mt-4">
                                        <button type="submit" class="btn btn-success">Create Trade Offer</button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>

                    <!-- Trades Column -->
                    <div class="col-lg-7">
                        <!-- Your Active Trades -->
                        <div class="mb-5">
                            <h3 class="text-center mb-3">Your Active Trades</h3>
                            <div id="user-trades-list">
                                ${renderUserTrades(trades, user)}
                            </div>
                        </div>

                        <!-- Public Trades List -->
                        <div>
                            <h3 class="text-center mb-3">Public Trade Offers</h3>
                            <div id="public-trades-list">
                                ${renderTradeList(trades, user)}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },
    addEventListeners: () => {
        // Guard clause to ensure this only runs on the trades page
        if (!document.getElementById('create-trade-form')) {
            return;
        }

        // --- Helper functions for form logic ---
        const getCreditValue = (elementId) => {
            const input = document.getElementById(elementId);
            return input ? parseInt(input.value, 10) : 0;
        };

        const getSelectedStickerItems = (id, isUserOwned) => {
            const checkboxes = document.querySelectorAll(`#${id}-list .sticker-checkbox:checked`);
            return Array.from(checkboxes).map(cb => {
                const stickerId = cb.getAttribute('data-sticker-id');
                const qtyInput = document.getElementById(`${id}-qty-${stickerId}`);
                let max;
                if (isUserOwned) {
                    const sticker = user.ownedStickers.find(s => s.sticker._id === stickerId || s.sticker === stickerId);
                    max = sticker ? sticker.quantity : undefined;
                }
                let quantity = parseInt(qtyInput.value, 10) || 1;
                if (max && quantity > max) quantity = max;
                return { sticker: stickerId, quantity };
            });
        };

        const getTradeItemsFromForm = (tradeType) => {
            let proposerItems = [], requestedItems = [];

            if (tradeType === 'cards-for-cards' || tradeType === 'cards-for-credits') {
                const offeredStickerItems = getSelectedStickerItems('offer-stickers', true);
                if (offeredStickerItems.length === 0) {
                    showToast('You must select at least one sticker to offer.', 'warning');
                    return null;
                }
                proposerItems = offeredStickerItems;
            } else if (tradeType === 'credits-for-cards') {
                const credits = getCreditValue('offer-credits');
                if (!credits || credits <= 0) {
                    showToast('You must offer a positive amount of credits.', 'warning');
                    return null;
                }
                proposerItems = [{ isCredit: true, amount: credits }];
            }

            if (tradeType === 'cards-for-cards' || tradeType === 'credits-for-cards') {
                const requestedStickerItems = getSelectedStickerItems('request-stickers', false);
                if (requestedStickerItems.length === 0) {
                    showToast('You must select at least one sticker to request.', 'warning');
                    return null;
                }
                requestedItems = requestedStickerItems;
            } else if (tradeType === 'cards-for-credits') {
                const credits = getCreditValue('request-credits');
                if (!credits || credits <= 0) {
                    showToast('You must request a positive amount of credits.', 'warning');
                    return null;
                }
                requestedItems = [{ isCredit: true, amount: credits }];
            }
            return { proposerItems, requestedItems };
        };

        const getConfirmationMessage = (user, proposerItems, requestedItems) => {
            if (!user) return { needsConfirm: false, confirmMsg: '' };

            const lastStickerNames = proposerItems
                .filter(item => item.sticker && user.ownedStickers.some(s => (s.sticker._id === item.sticker || s.sticker === item.sticker) && s.quantity === 1))
                .map(item => allPossibleStickers.find(s => s._id === item.sticker)?.name || 'Unknown Sticker');

            const alreadyOwnedNames = requestedItems
                .filter(item => item.sticker && user.ownedStickers.some(s => s.sticker._id === item.sticker || s.sticker === item.sticker))
                .map(item => allPossibleStickers.find(s => s._id === item.sticker)?.name || 'Unknown Sticker');

            let confirmMsg = '';
            if (lastStickerNames.length > 0) {
                confirmMsg += `You are offering your last copy of: ${lastStickerNames.join(', ')}.`;
            }
            if (alreadyOwnedNames.length > 0) {
                if (confirmMsg) confirmMsg += '\n';
                confirmMsg += `You already own: ${alreadyOwnedNames.join(', ')}.`;
            }

            const needsConfirm = lastStickerNames.length > 0 || alreadyOwnedNames.length > 0;
            if (needsConfirm) {
                confirmMsg += '\nDo you want to proceed?';
            }

            return { needsConfirm, confirmMsg };
        };

        const handleCreateTrade = async (e) => {
            e.preventDefault();
            const tradeType = document.querySelector('input[name="trade-type"]:checked').value;
            const items = getTradeItemsFromForm(tradeType);
            if (!items) return;

            const { proposerItems, requestedItems } = items;

            const user = await getUserProfile().then(res => res.data).catch(() => null);
            const { needsConfirm, confirmMsg } = getConfirmationMessage(user, proposerItems, requestedItems);

            if (needsConfirm) {
                const confirmed = await showConfirmModal(confirmMsg, 'Proceed', 'Cancel');
                if (!confirmed) return;
            }

            try {
                await createTrade({ proposerItems, requestedItems });
                showToast('Trade offer created successfully!', 'success');
                await refreshTrades();
            } catch (error) {
                showToast(error.message || 'Failed to create trade.', 'danger');
                console.error('Trade creation error:', error);
            }
        };

        const initializeForm = (user, allPossibleStickers) => {
            const offeringSection = document.getElementById('offering-section');
            const requestingSection = document.getElementById('requesting-section');

            const renderCreditInput = (id, max) => `
                <div class="mb-3">
                    <label for="${id}" class="form-label">Amount of Credits</label>
                    <input type="number" class="form-control" id="${id}" placeholder="Enter amount" min="1" ${max ? `max="${Math.floor(max)}"` : ''} required>
                    ${max ? `<div class="form-text">Your balance: ${Math.floor(max)} credits</div>` : ''}
                </div>`;

            const renderStickerSelector = (id, stickers, isUserOwned) => {
                // Custom list with checkboxes and quantity inputs
                const options = stickers.map(s => {
                    const stickerData = isUserOwned ? s.sticker : s;
                    const quantity = isUserOwned ? s.quantity : '';
                    const quantityText = quantity ? `(Owned: ${quantity})` : '';
                    return `<div class="d-flex align-items-center mb-1 sticker-row">
                        <input type="checkbox" class="form-check-input me-2 sticker-checkbox" data-sticker-id="${stickerData._id}" id="${id}-cb-${stickerData._id}">
                        <label for="${id}-cb-${stickerData._id}" class="flex-grow-1">${stickerData.name} ${quantityText}</label>
                        <input type="number" class="form-control ms-2 sticker-qty-input" data-sticker-id="${stickerData._id}" id="${id}-qty-${stickerData._id}" value="1" min="1" style="width:70px;" ${isUserOwned && quantity ? `max='${quantity}'` : ''} disabled>
                    </div>`;
                }).join('');

                // Add a search bar for sticker selectors
                let searchBar = '';
                if (id === 'request-stickers' || id === 'offer-stickers') {
                    const placeholder = id === 'request-stickers'
                        ? 'Search for a sticker to request...'
                        : 'Search in your stickers to offer...';
                    searchBar = `
                        <div class="mb-2">
                            <input type="text" id="${id}-search" class="form-control" placeholder="${placeholder}">
                        </div>
                    `;
                }

                return `
                    <div class="mb-3">
                        <label class="form-label">Select Sticker(s)</label>
                        ${searchBar}
                        <div id="${id}-list" style="max-height: 220px; overflow-y: auto; border: 1px solid #ddd; border-radius: 4px; padding: 8px; background: #fafbfc;">${options}</div>
                    </div>`;
            };

            const renderForm = (tradeType) => {
                offeringSection.innerHTML = '<h5 class="text-success">You Offer:</h5>';
                requestingSection.innerHTML = '<h5 class="text-primary">You Request:</h5>';
                if (tradeType === 'cards-for-cards') {
                    offeringSection.innerHTML += renderStickerSelector('offer-stickers', user.ownedStickers, true);
                    requestingSection.innerHTML += renderStickerSelector('request-stickers', allPossibleStickers, false);
                } else if (tradeType === 'credits-for-cards') {
                    offeringSection.innerHTML += renderCreditInput('offer-credits', user.credits);
                    requestingSection.innerHTML += renderStickerSelector('request-stickers', allPossibleStickers, false);
                } else if (tradeType === 'cards-for-credits') {
                    offeringSection.innerHTML += renderStickerSelector('offer-stickers', user.ownedStickers, true);
                    requestingSection.innerHTML += renderCreditInput('request-credits');
                }
                addSearchFilter('offer-stickers-search', 'offer-stickers');
                addSearchFilter('request-stickers-search', 'request-stickers');
                setupStickerQtyInputs('offer-stickers');
                setupStickerQtyInputs('request-stickers');
            };

            // Helper to attach search filter functionality
            const addSearchFilter = (inputId, listId) => {
                const searchInput = document.getElementById(inputId);
                if (searchInput) {
                    searchInput.addEventListener('keyup', () => {
                        const filter = searchInput.value.toLowerCase();
                        const list = document.getElementById(`${listId}-list`);
                        if (!list) return;
                        const rows = list.getElementsByClassName('sticker-row');
                        for (const row of rows) {
                            const label = row.querySelector('label');
                            const txtValue = label ? label.textContent : '';
                            row.style.display = txtValue.toLowerCase().indexOf(filter) > -1 ? '' : 'none';
                        }
                    });
                }
            };

            // After rendering, enable/disable quantity input based on checkbox
            function setupStickerQtyInputs(sectionId) {
                const list = document.getElementById(`${sectionId}-list`);
                if (!list) return;
                list.querySelectorAll('.sticker-checkbox').forEach(cb => {
                    const stickerId = cb.getAttribute('data-sticker-id');
                    const qtyInput = document.getElementById(`${sectionId}-qty-${stickerId}`);
                    cb.addEventListener('change', () => {
                        qtyInput.disabled = !cb.checked;
                    });
                });
            }

            renderForm('cards-for-cards');
            document.querySelectorAll('input[name="trade-type"]').forEach(radio => {
                radio.addEventListener('change', (e) => renderForm(e.target.value));
            });
            document.getElementById('create-trade-form').addEventListener('submit', handleCreateTrade);
        };

        const handleAcceptTrade = async (e) => {
            const tradeId = e.target.getAttribute('data-trade-id');
            const trade = trades.find(t => t._id === tradeId);
            if (!trade) {
                showToast('Trade not found.', 'danger');
                return;
            }
            const user = await getUserProfile().then(res => res.data).catch(() => null);
            if (!user) {
                showToast('Could not load your profile. Please try again.', 'danger');
                return;
            }
            // Extract logic for last sticker and already owned names
            function getLastStickerNames(items) {
                return items.filter(item => item.sticker && user.ownedStickers.some(s => (s.sticker._id === item.sticker._id || s.sticker === item.sticker) && s.quantity === 1))
                    .map(item => item.sticker.name || 'Unknown Sticker');
            }
            function getAlreadyOwnedNames(items) {
                return items.filter(item => item.sticker && user.ownedStickers.some(s => s.sticker._id === item.sticker._id || s.sticker === item.sticker))
                    .map(item => item.sticker.name || 'Unknown Sticker');
            }
            const lastStickerNames = getLastStickerNames(trade.requestedItems);
            const alreadyOwnedNames = getAlreadyOwnedNames(trade.proposerItems);
            let confirmMsg = '';
            if (lastStickerNames.length > 0) {
                confirmMsg += `You are about to give away your last copy of: ${lastStickerNames.join(', ')}.`;
            }
            if (alreadyOwnedNames.length > 0) {
                if (confirmMsg) confirmMsg += '\n';
                confirmMsg += `You already own: ${alreadyOwnedNames.join(', ')}.`;
            }
            if (confirmMsg) confirmMsg += '\n';
            confirmMsg += 'Are you sure you want to accept this trade? Make sure you have the requested items!';
            const confirmed = (lastStickerNames.length > 0 || alreadyOwnedNames.length > 0)
                ? await showConfirmModal(confirmMsg, 'Accept Trade', 'Cancel')
                : await showConfirmModal('Are you sure you want to accept this trade? Make sure you have the requested items!', 'Accept Trade', 'Cancel');
            if (confirmed) {
                try {
                    await acceptTrade(tradeId);
                    showToast('Trade accepted successfully!', 'success');
                    await refreshTrades();
                } catch (error) {
                    if (error.message?.includes('proposer no longer owns')) {
                        showToast('Trade failed: The proposer no longer owns the required sticker(s) or credits. This trade will be removed.', 'danger');
                    } else if (error.message?.includes('do not have the required sticker')) {
                        showToast('You do not have all the required stickers or enough quantity to accept this trade. Please check your album and try again.', 'danger');
                    } else {
                        showToast(error.message || 'Failed to accept trade. Do you have the required items?', 'danger');
                    }
                    await refreshTrades();
                    console.error('Error accepting trade:', error);
                }
            }
        };

        const handleCancelTrade = async (e) => {
            const tradeId = e.target.getAttribute('data-trade-id');
            // Use showConfirmModal instead of confirm()
            const confirmed = await showConfirmModal('Are you sure you want to cancel this trade offer?');
            if (confirmed) {
                try {
                    await cancelTrade(tradeId);
                    showToast('Trade canceled successfully!', 'success');
                    await refreshTrades();
                } catch (error) {
                    showToast(error.message || 'Failed to cancel trade.', 'danger');
                    console.error('Error canceling trade:', error);
                }
            }
        };

        Promise.all([
            getUserProfile().then(res => res.data),
            getAllStickers().then(res => res.data)
        ]).then(([userData, stickers]) => {
            user = userData;
            allPossibleStickers = stickers;
            if (user && allPossibleStickers) {
                initializeForm(user, allPossibleStickers);
            }
        }).catch(err => {
            console.error("Could not initialize trade page event listeners:", err);
        });

        document.querySelectorAll('.accept-trade-btn').forEach(button => button.addEventListener('click', handleAcceptTrade));
        document.querySelectorAll('.cancel-trade-btn').forEach(button => button.addEventListener('click', handleCancelTrade));
    }
};

// Helper to refresh the trades page UI after an action
async function refreshTrades() {
    const container = document.querySelector('.container');
    if (!container) return;
    // Re-render the page
    container.innerHTML = await TradesPage.render();
    // Re-attach event listeners
    TradesPage.addEventListeners();
}

// Utility: Show a Bootstrap-styled confirmation modal
function showConfirmModal(message, confirmText = 'Yes', cancelText = 'No') {
    return new Promise((resolve) => {
        let modal = document.getElementById('site-confirm-modal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'site-confirm-modal';
            modal.innerHTML = `
            <div class="modal fade" tabindex="-1" id="site-confirm-modal" aria-hidden="true">
              <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content">
                  <div class="modal-header">
                    <h5 class="modal-title">Please Confirm</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                  </div>
                  <div class="modal-body">
                    <p id="site-confirm-modal-message"></p>
                  </div>
                  <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" id="site-confirm-cancel"></button>
                    <button type="button" class="btn btn-primary" id="site-confirm-ok"></button>
                  </div>
                </div>
              </div>
            </div>`;
            document.body.appendChild(modal);
        }
        // Set message and button text
        document.getElementById('site-confirm-modal-message').textContent = message;
        document.getElementById('site-confirm-ok').textContent = confirmText;
        document.getElementById('site-confirm-cancel').textContent = cancelText;
        // Show modal (Bootstrap 5)
        const bsModal = new bootstrap.Modal(modal.querySelector('.modal'));
        bsModal.show();
        // Cleanup old listeners
        const okBtn = document.getElementById('site-confirm-ok');
        const cancelBtn = document.getElementById('site-confirm-cancel');
        const closeBtn = modal.querySelector('.btn-close');
        const cleanup = () => {
            okBtn.removeEventListener('click', onOk);
            cancelBtn.removeEventListener('click', onCancel);
            if (closeBtn) closeBtn.removeEventListener('click', onCancel);
        };
        function onOk() {
            cleanup();
            bsModal.hide();
            resolve(true);
        }
        function onCancel() {
            cleanup();
            bsModal.hide();
            resolve(false);
        }
        okBtn.addEventListener('click', onOk);
        cancelBtn.addEventListener('click', onCancel);
        if (closeBtn) closeBtn.addEventListener('click', onCancel);
        // Also handle modal dismissal (e.g., clicking backdrop)
        modal.querySelector('.modal').addEventListener('hidden.bs.modal', () => {
            cleanup();
            resolve(false);
        }, { once: true });
    });
}