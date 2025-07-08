const getStatusHtml = (sticker) => {
    if (typeof sticker.alive !== 'boolean') {
        return '';
    }
    const status = sticker.alive ? 'Alive' : 'Deceased';
    return `<p><strong>Status:</strong> ${status}</p>`;
};

const getBooleanPropertyHtml = (sticker, prop, label) => {
    if (typeof sticker[prop] !== 'boolean') {
        return '';
    }
    const value = sticker[prop] ? 'Yes' : 'No';
    return `<p><strong>${label}:</strong> ${value}</p>`;
};

const createStickerCard = (stickerData) => {
    const { sticker, quantity } = stickerData;
    const isOwned = quantity > 0;

    const imagePlaceholder = `
        <div class="card-img-top d-flex align-items-center justify-content-center" style="height: 200px; background-color: #333;">
            <i class="fas fa-image fa-3x text-muted"></i>
        </div>
    `;
    const imageUrl = sticker.imageUrl ? `<img src="${sticker.imageUrl}" class="card-img-top" alt="${sticker.name}">` : imagePlaceholder;
    const quantityBadge = isOwned ? `<span class="sticker-quantity-badge">x${quantity}</span>` : '';
    const cardClass = isOwned ? 'sticker-owned' : 'sticker-not-owned';

    return `
        <div class="col-md-4 col-lg-3 mb-4 sticker-container" data-name="${sticker.name.toLowerCase()}" data-owned="${isOwned}">
            <div class="card sticker-card ${cardClass}">
                ${imageUrl}
                ${quantityBadge}
                <div class="card-body">
                    <h5 class="card-title">${sticker.name}</h5>
                    <p class="card-text small">${sticker.description || 'No description available.'}</p>
                    <button class="btn btn-sm btn-info" data-bs-toggle="modal" data-bs-target="#stickerModal-${sticker._id}">Details</button>
                </div>
            </div>
        </div>
    `;
};

const createStickerModal = (sticker) => {
    const wandDetails = [sticker.wand?.wood, sticker.wand?.core, sticker.wand?.length ? `${sticker.wand.length}"` : ''].filter(Boolean).join(', ');
    return `
        <div class="modal fade" id="stickerModal-${sticker._id}" tabindex="-1" aria-labelledby="stickerModalLabel-${sticker._id}" aria-hidden="true">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="stickerModalLabel-${sticker._id}">${sticker.name}</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <div class="row">
                            <div class="col-md-4">
                                <img src="${sticker.imageUrl}" class="img-fluid" alt="${sticker.name}">
                            </div>
                            <div class="col-md-8">
                                ${sticker.actor ? `<p><strong>Actor:</strong> ${sticker.actor}</p>` : ''}
                                ${sticker.alternate_names?.length ? `<p><strong>Alternate Names:</strong> ${sticker.alternate_names.join(', ')}</p>` : ''}
                                ${getStatusHtml(sticker)}
                                ${sticker.species ? `<p><strong>Species:</strong> ${sticker.species}</p>` : ''}
                                ${sticker.gender ? `<p><strong>Gender:</strong> ${sticker.gender}</p>` : ''}
                                ${sticker.house ? `<p><strong>House:</strong> ${sticker.house}</p>` : ''}
                                ${sticker.ancestry ? `<p><strong>Ancestry:</strong> ${sticker.ancestry}</p>` : ''}
                                ${sticker.eyeColour ? `<p><strong>Eye Colour:</strong> ${sticker.eyeColour}</p>` : ''}
                                ${sticker.hairColour ? `<p><strong>Hair Colour:</strong> ${sticker.hairColour}</p>` : ''}
                                ${sticker.dateOfBirth ? `<p><strong>Date of Birth:</strong> ${sticker.dateOfBirth}</p>` : ''}
                                ${sticker.yearOfBirth ? `<p><strong>Year of Birth:</strong> ${sticker.yearOfBirth}</p>` : ''}
                                ${wandDetails ? `<p><strong>Wand:</strong> ${wandDetails}</p>` : ''}
                                ${sticker.patronus ? `<p><strong>Patronus:</strong> ${sticker.patronus}</p>` : ''}
                                ${getBooleanPropertyHtml(sticker, 'hogwartsStudent', 'Hogwarts Student')}
                                ${getBooleanPropertyHtml(sticker, 'hogwartsStaff', 'Hogwarts Staff')}
                                ${getBooleanPropertyHtml(sticker, 'wizard', 'Wizard')}
                                <hr>
                                <p>${sticker.description}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
};

const AlbumPage = {
    allStickersWithOwnership: [],
    currentView: 'owned', // 'owned' or 'all'

    render: async () => {
        try {
            const { data: user } = await getUserProfile();
            const { data: allStickers } = await getAllStickers();

            const ownedStickerMap = new Map(user.ownedStickers.map(s => [s.sticker._id, s.quantity]));

            AlbumPage.allStickersWithOwnership = allStickers.map(sticker => ({
                sticker,
                quantity: ownedStickerMap.get(sticker._id) || 0,
            }));

            if (user.ownedStickers.length === 0 && AlbumPage.currentView === 'owned') {
                return `
                    <div class="container">
                         <div class="d-flex justify-content-between align-items-center mb-4">
                            <h2>My Album (${user.username})</h2>
                            <h4>Credits: ${Math.floor(user.credits)}</h4>
                        </div>
                        <div class="d-flex justify-content-between align-items-center mb-4">
                            <div class="form-check form-switch">
                                <input class="form-check-input" type="checkbox" role="switch" id="album-view-toggle">
                                <label class="form-check-label" for="album-view-toggle">Show All Stickers</label>
                            </div>
                            <div class="w-50">
                                <input type="text" id="album-search-bar" class="form-control" placeholder="Search for a character...">
                            </div>
                        </div>
                        <div class="text-center">
                            <p>Your album is empty. Go to the <a href="/shop" onclick="navigateTo('/shop'); event.preventDefault();">Shop</a> to buy some sticker packs!</p>
                        </div>
                    </div>
                `;
            }

            const stickerModals = AlbumPage.allStickersWithOwnership.map(data => createStickerModal(data.sticker)).join('');

            return `
                <div class="container">
                    <div class="d-flex justify-content-between align-items-center mb-4">
                        <h2>My Album (${user.username})</h2>
                        <h4>Credits: ${Math.floor(user.credits)}</h4>
                    </div>
                    <div class="d-flex justify-content-between align-items-center mb-4">
                        <div class="form-check form-switch fs-5">
                            <input class="form-check-input" type="checkbox" role="switch" id="album-view-toggle" ${AlbumPage.currentView === 'all' ? 'checked' : ''}>
                            <label class="form-check-label" for="album-view-toggle">Show All Stickers</label>
                        </div>
                        <div class="w-50">
                            <input type="text" id="album-search-bar" class="form-control" placeholder="Search for a character...">
                        </div>
                    </div>
                    <div id="album-grid" class="row">
                        <!-- Sticker cards will be rendered here by addEventListeners -->
                    </div>
                    ${stickerModals}
                </div>
            `;
        } catch (error) {
            console.error('Error loading album:', error);
            return `<p class="text-danger">Could not load your album. Please try logging in again.</p>`;
        }
    },

    renderStickerGrid: () => {
        const grid = document.getElementById('album-grid');
        if (!grid) return;

        const stickersToRender = AlbumPage.currentView === 'owned'
            ? AlbumPage.allStickersWithOwnership.filter(s => s.quantity > 0)
            : AlbumPage.allStickersWithOwnership;

        grid.innerHTML = stickersToRender.map(createStickerCard).join('');
    },

    addEventListeners: () => {
        const searchBar = document.getElementById('album-search-bar');
        const viewToggle = document.getElementById('album-view-toggle');

        const handleSearch = () => {
            const searchTerm = searchBar.value.toLowerCase();
            const stickerContainers = document.querySelectorAll('#album-grid .sticker-container');

            stickerContainers.forEach(container => {
                const characterName = container.dataset.name;
                if (characterName.includes(searchTerm)) {
                    container.style.display = '';
                } else {
                    container.style.display = 'none';
                }
            });
        };

        if (searchBar) {
            searchBar.addEventListener('keyup', handleSearch);
        }

        if (viewToggle) {
            viewToggle.addEventListener('change', (e) => {
                AlbumPage.currentView = e.target.checked ? 'all' : 'owned';
                AlbumPage.renderStickerGrid();
                handleSearch(); // Re-apply search filter to the new view
            });
        }

        // Initial render of the grid
        AlbumPage.renderStickerGrid();
    }
};