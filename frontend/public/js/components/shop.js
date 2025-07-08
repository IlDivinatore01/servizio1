const ShopPage = {
    render: async () => {
        try {
            const userProfile = await getUserProfile();
            const user = userProfile.data;
            const isAdmin = user.role === 'admin';
            const packs = await getStickerPacks();
            console.log('DEBUG packs.data:', packs.data); // Debug: check isCustom property
            const packCards = packs.data.map(pack => {
                // Allow delete for any custom pack (isCustom: true) if admin
                const isCustomPack = pack.isCustom === true;
                return `
                    <div class="col-md-6 col-lg-4 mb-4">
                        <div class="card h-100 text-center">
                            <div class="card-body">
                                 <h5 class="card-title">${pack.name}</h5>
                                 <p class="card-text">Contains ${pack.numStickers} random stickers.</p>
                                 <p class="card-text"><strong>Cost: <span class="pack-cost-value">${pack.cost}</span> Credits</strong></p>
                                 ${pack.isSpecialOffer ? `<p class="text-danger">Special Offer!</p>` : ''}
                                 <div class="d-flex justify-content-center align-items-center my-3">
                                     <button class="btn btn-secondary btn-sm quantity-minus" data-pack-id="${pack._id}">-</button>
                                     <input type="number" class="form-control text-center mx-2 quantity-input" value="1" min="1" max="100" data-pack-id="${pack._id}" style="width: 70px;" readonly>
                                     <button class="btn btn-secondary btn-sm quantity-plus" data-pack-id="${pack._id}">+</button>
                                 </div>
                                 <button class="btn btn-primary buy-pack-btn" data-pack-id="${pack._id}">Buy Now</button>
                                 ${isAdmin && isCustomPack ? `<button class="btn btn-danger btn-sm mt-2 delete-pack-btn" data-pack-id="${pack._id}">Delete Pack</button>` : ''}
                            </div>
                        </div>
                    </div>
                `;
            }).join('');

            const creditBundles = [
                { amount: 1, price: '1.50' },
                { amount: 5, price: '7.00' },
                { amount: 10, price: '12.00' },
                { amount: 20, price: '20.00' },
            ];

            const creditCards = creditBundles.map(bundle => `
                <div class="col-md-6 col-lg-3 mb-4">
                    <div class="card h-100 text-center">
                        <div class="card-body">
                            <h5 class="card-title">${bundle.amount} Credits</h5>
                            <p class="card-text"><strong>Price: €${bundle.price}</strong></p>
                            <button class="btn btn-success buy-credits-btn" data-amount="${bundle.amount}" data-price="${bundle.price}">Buy Now</button>
                        </div>
                    </div>
                </div>
            `).join('');

            const adminPackForm = isAdmin ? `
                <div class="card mb-4">
                    <div class="card-body">
                        <h5 class="card-title">Create Custom Pack</h5>
                        <form id="admin-create-pack-form">
                            <div class="row g-2 align-items-end">
                                <div class="col-md-4">
                                    <label class="form-label">Pack Name</label>
                                    <input type="text" class="form-control" id="admin-pack-name" required />
                                </div>
                                <div class="col-md-4">
                                    <label class="form-label">Number of Cards</label>
                                    <input type="number" class="form-control" id="admin-pack-num" min="1" required />
                                </div>
                                <div class="col-md-4">
                                    <label class="form-label">Cost (Credits)</label>
                                    <input type="number" class="form-control" id="admin-pack-cost" min="1" required />
                                </div>
                            </div>
                            <button type="submit" class="btn btn-success mt-3">Create Pack</button>
                        </form>
                    </div>
                </div>
            ` : '';

            return `
                <div class="container">
                    <h2 class="text-center mb-4">Sticker Shop</h2>
                    <div class="d-flex justify-content-end align-items-center mb-3">
                        <span class="badge bg-primary fs-5">Current Credits: <span id="current-credits">${Math.floor(user.credits)}</span></span>
                    </div>
                    ${adminPackForm}
                    <div class="row justify-content-center">
                        ${packCards}
                    </div>
                    <hr class="my-5" />
                    <h2 class="text-center mb-4">Purchase Credits</h2>
                    <div class="row justify-content-center">
                        ${creditCards}
                    </div>
                </div>

                <!-- Purchase Modal -->
                <div class="modal fade" id="purchaseModal" tabindex="-1">
                    <div class="modal-dialog">
                        <div class="modal-content">
                            <div class="modal-header">
                                <h5 class="modal-title" id="purchaseModalLabel">Complete Your Purchase</h5>
                                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                            </div>
                            <div class="modal-body">
                                <p>You are buying <strong id="modal-credit-amount"></strong> credits for <strong id="modal-credit-price"></strong>.</p>
                                <form id="credit-card-form">
                                    <div class="mb-3">
                                        <label for="card-number" class="form-label">Credit Card Number</label>
                                        <input type="text" class="form-control" id="card-number" placeholder="1111-2222-3333-4444" required>
                                    </div>
                                    <div class="row">
                                        <div class="col-md-6 mb-3">
                                            <label for="expiry-date" class="form-label">Expiry Date</label>
                                            <input type="text" class="form-control" id="expiry-date" placeholder="MM/YY" required>
                                        </div>
                                        <div class="col-md-6 mb-3">
                                            <label for="cvc" class="form-label">CVC</label>
                                            <input type="text" class="form-control" id="cvc" placeholder="123" required>
                                        </div>
                                    </div>
                                    <button type="submit" class="btn btn-primary w-100">Confirm Purchase</button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Pack Purchase Confirmation Modal -->
                <div class="modal fade" id="packConfirmModal" tabindex="-1">
                    <div class="modal-dialog">
                        <div class="modal-content">
                            <div class="modal-header">
                                <h5 class="modal-title">Confirm Pack Purchase</h5>
                                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                            </div>
                            <div class="modal-body text-center">
                                <div class="mb-3">
                                    <i class="fas fa-box-open fa-3x text-primary mb-3"></i>
                                    <h4 id="pack-name"></h4>
                                    <p class="text-muted">Contains <span id="pack-stickers"></span> random stickers</p>
                                </div>
                                <div class="alert alert-info">
                                    <strong>Cost: <span id="pack-cost"></span> Credits</strong>
                                </div>
                                <p>You are buying <strong id="pack-quantity"></strong> pack(s).</p>
                                <p>Are you sure you want to purchase this pack?</p>
                            </div>
                            <div class="modal-footer">
                                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                                <button type="button" class="btn btn-primary" id="confirm-pack-purchase">
                                    <i class="fas fa-shopping-cart"></i> Purchase Pack
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Pack Opening Modal -->
                <div class="modal fade" id="packOpeningModal" tabindex="-1" data-bs-backdrop="static">
                    <div class="modal-dialog modal-lg">
                        <div class="modal-content">
                            <div class="modal-header">
                                <h5 class="modal-title">🎉 Pack Opening!</h5>
                            </div>
                            <div class="modal-body text-center">
                                <div id="pack-opening-content">
                                    <div class="mb-4">
                                        <div class="pack-opening-animation">
                                            <i class="fas fa-box fa-4x text-primary pack-bounce"></i>
                                        </div>
                                        <p class="mt-3">Opening your pack...</p>
                                    </div>
                                </div>
                                <div id="cards-reveal" class="row" style="display: none;">
                                    <div class="col-12 mb-3">
                                        <h4 class="text-success">🎊 Your New Cards! 🎊</h4>
                                    </div>
                                </div>
                            </div>
                            <div class="modal-footer" style="display: none;" id="pack-modal-footer">
                                <button type="button" class="btn btn-success" data-bs-dismiss="modal">
                                    <i class="fas fa-check"></i> Awesome!
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <style>
                    .pack-bounce {
                        animation: bounce 1s infinite;
                    }
                    
                    @keyframes bounce {
                        0%, 20%, 50%, 80%, 100% {
                            transform: translateY(0);
                        }
                        40% {
                            transform: translateY(-10px);
                        }
                        60% {
                            transform: translateY(-5px);
                        }
                    }
                    
                    .card-reveal {
                        animation: cardReveal 0.8s ease-out;
                        animation-fill-mode: both;
                    }
                    
                    @keyframes cardReveal {
                        0% {
                            opacity: 0;
                            transform: scale(0.8) rotateY(90deg);
                        }
                        100% {
                            opacity: 1;
                            transform: scale(1) rotateY(0deg);
                        }
                    }
                    
                    .sticker-card {
                        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                        border: 2px solid #gold;
                        border-radius: 15px;
                        color: white;
                        padding: 15px;
                        margin: 10px;
                        box-shadow: 0 8px 16px rgba(0,0,0,0.2);
                        transition: transform 0.3s ease;
                    }
                    
                    .sticker-card:hover {
                        transform: translateY(-5px);
                    }
                    
                    .sticker-card.rare {
                        background: linear-gradient(135deg, #ffeaa7 0%, #fab1a0 100%);
                        border-color: #fdcb6e;
                    }
                    
                    .sticker-card.epic {
                        background: linear-gradient(135deg, #a29bfe 0%, #6c5ce7 100%);
                        border-color: #7d3cff;
                    }
                    
                    .sticker-card.legendary {
                        background: linear-gradient(135deg, #fd79a8 0%, #e17055 100%);
                        border-color: #ff6b6b;
                    }
                    
                    .pack-cards-grid {
                        display: grid;
                        grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
                        gap: 10px;
                    }
                </style>
            `;
        } catch (error) {
             console.error('Error loading shop:', error);
             return `<p class="text-danger">Could not load the shop. Please try again later.</p>`;
        }
    },
    addEventListeners: () => {
        // Pack purchase confirmation
        const packConfirmModal = new bootstrap.Modal(document.getElementById('packConfirmModal'));
        const packOpeningModal = new bootstrap.Modal(document.getElementById('packOpeningModal'));
        let selectedPackId = null;
        let selectedQuantity = 1;
        
        document.querySelectorAll('.buy-pack-btn').forEach(button => {
            button.addEventListener('click', async (e) => {
                selectedPackId = e.target.getAttribute('data-pack-id');
                const card = e.target.closest('.card');
                const packName = card.querySelector('.card-title').textContent;
                const packCost = parseInt(card.querySelector('.pack-cost-value').textContent, 10);
                const numStickersText = card.querySelector('.card-text').textContent; // "Contains X random stickers."
                const stickersPerPack = parseInt(numStickersText.match(/(\d+)/)[0], 10);
                const quantity = parseInt(card.querySelector('.quantity-input').value, 10);
                selectedQuantity = quantity; // Store the selected quantity
                const totalCost = packCost * quantity;
                const totalStickers = stickersPerPack * quantity;

                document.getElementById('pack-name').textContent = packName;
                document.getElementById('pack-stickers').textContent = `${totalStickers}`; // Show total stickers
                document.getElementById('pack-cost').textContent = totalCost;
                document.getElementById('pack-quantity').textContent = quantity;
                packConfirmModal.show();
            });
        });

        // Add event listeners for quantity buttons
        document.querySelectorAll('.quantity-plus').forEach(button => {
            button.addEventListener('click', (e) => {
                const input = e.target.previousElementSibling;
                let value = parseInt(input.value, 10);
                value++;
                input.value = value;
                updateBuyButtonState(e.target.closest('.card'));
            });
        });

        document.querySelectorAll('.quantity-minus').forEach(button => {
            button.addEventListener('click', (e) => {
                const input = e.target.nextElementSibling;
                let value = parseInt(input.value, 10);
                if (value > 1) {
                    value--;
                    input.value = value;
                    updateBuyButtonState(e.target.closest('.card'));
                }
            });
        });

        // Function to enable/disable buy button based on credits
        const updateBuyButtonState = (card) => {
            const buyButton = card.querySelector('.buy-pack-btn');
            const packCost = parseInt(card.querySelector('.pack-cost-value').textContent, 10);
            const quantity = parseInt(card.querySelector('.quantity-input').value, 10);
            const totalCost = packCost * quantity;
            let currentCredits = parseInt(document.getElementById('current-credits').textContent, 10);

            // Fallback to 0 if currentCredits is NaN. This prevents buttons from being wrongly enabled.
            if (isNaN(currentCredits)) {
                currentCredits = 0;
            }

            if (totalCost > currentCredits) {
                buyButton.disabled = true;
                buyButton.textContent = 'Not Enough Credits';
            } else {
                buyButton.disabled = false;
                buyButton.textContent = 'Buy Now';
            }
        };

        // Initial check for all pack cards
        const initialCheck = () => {
            document.querySelectorAll('.card').forEach(card => {
                if (card.querySelector('.buy-pack-btn')) {
                    updateBuyButtonState(card);
                }
            });
        }
        initialCheck();

        // Confirm pack purchase
        document.getElementById('confirm-pack-purchase').addEventListener('click', async () => {
            if (!selectedPackId) return;

            packConfirmModal.hide(); // Hide confirmation modal immediately

            try {
                // First, attempt the purchase. This will throw an error if it fails (e.g., insufficient credits).
                const result = await buyPack(selectedPackId, selectedQuantity);
                console.log('Pack purchase successful:', result); // Debug log

                // If the purchase is successful, then show the opening modal and start the animation.
                packOpeningModal.show();

                // Update credits display in the background immediately after purchase
                // Ensure result.newCredits is a number before updating the UI to prevent NaN.
                if (result && typeof result.newCredits === 'number') {
                    document.getElementById('current-credits').textContent = Math.floor(result.newCredits);
                } else {
                    // Fallback: if newCredits is not available, refetch from the server
                    const userProfile = await getUserProfile();
                    document.getElementById('current-credits').textContent = Math.floor(userProfile.data.credits);
                }
                initialCheck(); // Re-check all buttons after purchase

                // Simulate pack opening delay for animation purposes
                setTimeout(() => {
                    // Hide the initial "Opening..." content
                    document.getElementById('pack-opening-content').style.display = 'none';

                    // Get the container for revealed cards
                    const cardsReveal = document.getElementById('cards-reveal');
                    if (!cardsReveal) {
                        console.error('cards-reveal element not found!');
                        packOpeningModal.hide();
                        return;
                    }
                    cardsReveal.style.display = 'block';

                    // Clear any previous cards from the modal
                    cardsReveal.innerHTML = `
                        <div class="col-12 text-center mb-4">
                            <h4 class="text-primary mb-2">✨ Your New Cards! ✨</h4>
                            <p class="text-muted">You received ${result.data ? result.data.length : 0} new sticker${result.data && result.data.length !== 1 ? 's' : ''}!</p>
                        </div>
                        <div class="pack-cards-grid"></div>
                    `;

                    const gridContainer = cardsReveal.querySelector('.pack-cards-grid');

                    if (!result.data || result.data.length === 0) {
                        gridContainer.innerHTML = `<div class="col-12"><p class="text-warning">No cards were found in this pack!</p></div>`;
                    } else {
                        // Reveal the cards with an animation
                        revealPackCards(result.data, gridContainer);
                        // Show the footer with the close button after the animation
                        showPackModalFooter(result.data.length);
                    }

                    showToast(`Pack opened! You got ${result.data.length} new cards!`, 'success');

                }, 2000); // 2-second delay for the animation

            } catch (error) {
                // If buyPack fails, this block is executed.
                console.error('Error purchasing pack:', error);
                // The pack opening modal is never shown. An error toast is displayed instead.
                showToast(error.message || 'Failed to purchase pack. Please try again later.', 'danger');
            }
        });

        // Helper function to reveal cards with animation
        const revealPackCards = (cards, gridContainer) => {
            cards.forEach((card, index) => {
                const cardElement = document.createElement('div');
                cardElement.className = 'pack-card-item';
                cardElement.style.width = '100%';
                cardElement.style.maxWidth = '200px';
                cardElement.style.margin = '0 auto';
                const imageUrl = card.imageUrl || card.image || card.picture || null;
                cardElement.innerHTML = `
                    <div class="sticker-card card-reveal" style="animation-delay: ${index * 0.2}s; width: 100%; height: 100%; display: flex; flex-direction: column;">
                        <div class="card-image-container" style="width: 100%; aspect-ratio: 3/4; min-height: 150px; max-height: 260px;">
                            ${imageUrl ?
                                `<img src="${imageUrl}" alt="${card.name || 'Character'}" class="card-image" style="width: 100%; height: 100%; object-fit: cover; border-radius: 8px;" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                                 <div class="card-placeholder" style="display: none;">
                                    <i class="fas fa-magic text-white-50"></i>
                                 </div>` :
                                `<div class="card-placeholder">
                                    <i class="fas fa-magic text-white-50"></i>
                                 </div>`
                            }
                        </div>
                        <div class="card-info">
                            <h6 class="card-name">${card.name || 'Unknown Character'}</h6>
                            <p class="card-house">${card.house || 'Unknown House'}</p>
                        </div>
                        <div class="card-sparkle"></div>
                    </div>
                `;
                setTimeout(() => {
                    gridContainer.appendChild(cardElement);
                }, index * 200);
            });
        };

        // Helper function to show the modal footer after cards are revealed
        const showPackModalFooter = (cardCount) => {
            setTimeout(() => {
                document.getElementById('pack-modal-footer').style.display = 'block';
            }, cardCount * 300 + 500);
        };

        // Credit purchase functionality (existing)
        const purchaseModal = new bootstrap.Modal(document.getElementById('purchaseModal'));
        let selectedAmount = 0;

        document.querySelectorAll('.buy-credits-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                selectedAmount = parseInt(e.target.getAttribute('data-amount'), 10);
                const price = e.target.getAttribute('data-price');
                document.getElementById('modal-credit-amount').textContent = selectedAmount;
                document.getElementById('modal-credit-price').textContent = `€${price}`;
                purchaseModal.show();
            });
        });

        document.getElementById('credit-card-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const cardNumber = document.getElementById('card-number').value;
            const expiryDate = document.getElementById('expiry-date').value;
            const cvc = document.getElementById('cvc').value;

            if (!cardNumber || !expiryDate || !cvc) {
                showToast('Please fill in all credit card details.', 'warning');
                return;
            }

            try {
                await purchaseCredits({ amount: selectedAmount });
                showToast(`${selectedAmount} credits purchased successfully!`);
                purchaseModal.hide();
                document.getElementById('credit-card-form').reset();
                // Refresh the page to update credit display
                setTimeout(async () => {
                    const userProfile = await getUserProfile();
                    document.getElementById('current-credits').textContent = Math.floor(userProfile.data.credits);
                    initialCheck(); // Re-check all buttons after credit purchase
                }, 500);
            } catch(error) {
                console.error('Error purchasing credits:', error);
                showToast('Failed to purchase credits. Please try again later.', 'danger');
            }
        });

        // Admin create pack
        const createPackForm = document.getElementById('admin-create-pack-form');
        if (createPackForm) {
            createPackForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const name = document.getElementById('admin-pack-name').value.trim();
                const numStickers = parseInt(document.getElementById('admin-pack-num').value, 10);
                const cost = parseInt(document.getElementById('admin-pack-cost').value, 10);
                if (!name || !numStickers || !cost) return showToast('All fields required', 'warning');
                try {
                    await createCustomPack({ name, numStickers, cost });
                    showToast('Custom pack created!', 'success');
                    router();
                } catch (err) {
                    showToast(err.message || 'Failed to create pack.', 'danger');
                }
            });
        }
        // Admin delete pack
        document.querySelectorAll('.delete-pack-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const packId = e.target.getAttribute('data-pack-id');
                if (confirm('Are you sure you want to delete this pack?')) {
                    try {
                        await deleteCustomPack(packId);
                        showToast('Pack deleted!', 'success');
                        router();
                    } catch (err) {
                        showToast(err.message || 'Failed to delete pack.', 'danger');
                    }
                }
            });
        });

        // Reset pack opening modal when it's closed
        document.getElementById('packOpeningModal').addEventListener('hidden.bs.modal', () => {
            document.getElementById('pack-opening-content').style.display = 'block';
            document.getElementById('cards-reveal').style.display = 'none';
            document.getElementById('pack-modal-footer').style.display = 'none';
            
            // Clear cards
            const cardsReveal = document.getElementById('cards-reveal');
            const existingCards = cardsReveal.querySelectorAll('.sticker-card');
            existingCards.forEach(card => card.remove());
        });
    }
};