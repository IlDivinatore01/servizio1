const TradesPage = {
    render: async () => {
        try {
            const { data: trades } = await getTradeOffers();

            const renderItems = (items) => {
                return items.map(item => {
                    if (item.isCredit) {
                        return `<li>${item.amount} Credits</li>`;
                    }
                    return `<li>${item.sticker.name} (x${item.quantity})</li>`;
                }).join('');
            };

            const tradeCards = trades.length > 0 ? trades.map(trade => `
                <div class="col-md-6 mb-4">
                    <div class="card trade-offer-card">
                        <div class="card-header">
                            Offer by: <strong>${trade.proposerId.username}</strong>
                        </div>
                        <div class="card-body">
                            <div class="row">
                                <div class="col-6">
                                    <h6>Offering:</h6>
                                    <ul>${renderItems(trade.proposerItems)}</ul>
                                </div>
                                <div class="col-6">
                                    <h6>Requesting:</h6>
                                    <ul>${renderItems(trade.requestedItems)}</ul>
                                </div>
                            </div>
                        </div>
                        <div class="card-footer text-end">
                            <button class="btn btn-success accept-trade-btn" data-trade-id="${trade._id}">Accept Trade</button>
                        </div>
                    </div>
                </div>
            `).join('') : '<p class="text-center">No open trades at the moment.</p>';

            return `
                <div class="container">
                    <h2 class="text-center mb-4">Trade Market</h2>
                    <p class="text-center fst-italic">Note: Creating new trades requires a dedicated UI. For now, you can accept existing offers.</p>
                    <div class="row">
                        ${tradeCards}
                    </div>
                </div>
            `;
        } catch (error) {
            console.error('Failed to load trade offers:', error);
            return `<p class="text-danger">Could not load trade offers.</p>`;
        }
    },
    addEventListeners: () => {
        document.querySelectorAll('.accept-trade-btn').forEach(button => {
            button.addEventListener('click', async (e) => {
                const tradeId = e.target.getAttribute('data-trade-id');
                if(confirm('Are you sure you want to accept this trade? Make sure you have the requested items!')) {
                    try {
                        await acceptTrade(tradeId);
                        showToast('Trade accepted successfully!');
                        router(); // Refresh the page
                    } catch (error) {
                        showToast('Failed to accept trade. Please try again.', 'error');
                        console.error('Error accepting trade:', error);
                    }
                }
            });
        });
    }
};