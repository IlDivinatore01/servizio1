const ShopPage = {
    render: async () => {
        try {
            const packs = await getStickerPacks();
            const packCards = packs.data.map(pack => `
                <div class="col-md-6 col-lg-4 mb-4">
                    <div class="card h-100 text-center">
                        <div class="card-body">
                             <h5 class="card-title">${pack.name}</h5>
                             <p class="card-text">Contains ${pack.numStickers} random stickers.</p>
                             <p class="card-text"><strong>Cost: ${pack.cost} Credits</strong></p>
                             ${pack.isSpecialOffer ? `<p class="text-danger">Special Offer!</p>` : ''}
                             <button class="btn btn-primary buy-pack-btn" data-pack-id="${pack._id}">Buy Now</button>
                        </div>
                    </div>
                </div>
            `).join('');

            return `
                <div class="container">
                    <h2 class="text-center mb-4">Sticker Shop</h2>
                    <div class="row justify-content-center">
                        ${packCards}
                    </div>
                    <hr class="my-5" />
                    <div class="row justify-content-center">
                        <div class="col-md-6">
                            <h3 class="text-center">Purchase Credits</h3>
                            <div class="input-group">
                                 <input type="number" id="credit-amount" class="form-control" placeholder="Enter amount" min="1">
                                 <button class="btn btn-success" id="buy-credits-btn">Purchase</button>
                            </div>
                            <div class="form-text text-center">Simulated purchase. No real money is involved.</div>
                        </div>
                    </div>
                </div>
            `;
        } catch (error) {
             console.error('Error loading shop:', error);
             return `<p class="text-danger">Could not load the shop. Please try again later.</p>`;
        }
    },
    addEventListeners: () => {
        document.querySelectorAll('.buy-pack-btn').forEach(button => {
            button.addEventListener('click', async (e) => {
                const packId = e.target.getAttribute('data-pack-id');
                try {
                    const result = await buyPack(packId);
                    showToast(`Pack purchased! You got: ${result.data.join(', ')}`);
                    // Optionally, navigate to album or refresh user credits display
                    router(); 
                } catch(error) {
                    console.error('Error purchasing pack:', error);
                    showToast('Failed to purchase pack. Please try again later.', 'danger');
                }
            });
        });
        
        // This functionality should ideally be in a separate component/controller
        // but for simplicity, we'll add the event listener here.
        // In a real app, user credit info would be in a shared state.
        const creditBtn = document.getElementById('buy-credits-btn');
        if (creditBtn) {
            creditBtn.addEventListener('click', async () => {
                const amount = parseInt(document.getElementById('credit-amount').value, 10);
                if(isNaN(amount) || amount <= 0) {
                    showToast('Please enter a valid amount.', 'warning');
                    return;
                }
                
                try {
                    // In a real app, you would require an external payment API call here
                    // For this project, we call a backend endpoint that directly adds credits.
                    const { purchaseCredits } = await import('../api.js'); // Lazy import since it's user-specific
                    await purchaseCredits({ amount });
                    showToast(`${amount} credits purchased successfully!`);
                    document.getElementById('credit-amount').value = '';
                } catch(error) {
                    console.error('Error purchasing credits:', error);
                    showToast('Failed to purchase credits. Please try again later.', 'danger');
                }
            });
        }
    }
};