const AlbumPage = {
    render: async () => {
        try {
            const { data: user } = await getUserProfile();
            const stickers = user.ownedStickers;

            if (stickers.length === 0) {
                return `
                    <div class="text-center">
                        <h2>My Album (${user.username})</h2>
                        <p>Your album is empty. Go to the <a href="/shop" onclick="navigateTo('/shop'); event.preventDefault();">Shop</a> to buy some sticker packs!</p>
                        <p>Credits: ${user.credits.toFixed(2)}</p>
                    </div>
                `;
            }

            const stickerCards = stickers.map(ownedSticker => {
                const sticker = ownedSticker.sticker;
                return `
                    <div class="col-md-4 col-lg-3 mb-4">
                        <div class="card sticker-card sticker-owned">
                            <img src="${sticker.imageUrl}" class="card-img-top" alt="${sticker.name}">
                            ${ownedSticker.quantity > 1 ? `<span class="sticker-duplicate">x${ownedSticker.quantity}</span>` : ''}
                            <div class="card-body">
                                <h5 class="card-title">${sticker.name}</h5>
                                <p class="card-text small">${sticker.description}</p>
                                <button class="btn btn-sm btn-info" data-bs-toggle="modal" data-bs-target="#stickerModal-${sticker._id}">Details</button>
                                ${ownedSticker.quantity > 1 ? `<button class="btn btn-sm btn-warning ms-2 sell-sticker-btn" data-sticker-id="${sticker._id}">Sell '1'</button>` : ''}
                            </div>
                        </div>
                    </div>

                    <div class="modal fade" id="stickerModal-${sticker._id}" tabindex="-1">
                        <div class="modal-dialog modal-lg">
                            <div class="modal-content">
                                <div class="modal-header">
                                    <h5 class="modal-title">${sticker.name}</h5>
                                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                                </div>
                                <div class="modal-body">
                                    <div class="row">
                                        <div class="col-md-5">
                                             <img src="${sticker.imageUrl}" class="img-fluid" alt="${sticker.name}">
                                        </div>
                                        <div class="col-md-7">
                                            <p><strong>House:</strong> ${sticker.house || 'N/A'}</p>
                                            <p><strong>Species:</strong> ${sticker.species || 'N/A'}</p>
                                            <p><strong>Wand:</strong> ${sticker.wand || 'N/A'}</p>
                                            <p><strong>Patronus:</strong> ${sticker.patronus || 'N/A'}</p>
                                            <hr>
                                            <p>${sticker.description}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
            }).join('');

            return `
                <div class="container">
                    <div class="d-flex justify-content-between align-items-center mb-4">
                        <h2>My Album (${user.username})</h2>
                        <h4>Credits: ${user.credits.toFixed(2)}</h4>
                    </div>
                    <div class="row">
                        ${stickerCards}
                    </div>
                </div>
            `;
        } catch (error) {
            console.error('Error loading album:', error);
            return `<p class="text-danger">Could not load your album. Please try logging in again.</p>`;
        }
    },
    addEventListeners: () => {
        document.querySelectorAll('.sell-sticker-btn').forEach(button => {
            button.addEventListener('click', async (e) => {
                const stickerId = e.target.getAttribute('data-sticker-id');
                if(confirm('Are you sure you want to sell one copy of this sticker?')) {
                    try {
                        await sellSticker(stickerId);
                        showToast('Sticker sold successfully!');
                        router(); // Re-render the page
                    } catch (error) {
                        console.error('Error selling sticker:', error);
                        showToast('Failed to sell sticker. Please try again.', 'error');
                    }
                }
            });
        });
    }
};