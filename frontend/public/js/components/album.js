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

const createStickerCard = (ownedSticker) => {
    const { sticker, quantity } = ownedSticker;
    const imagePlaceholder = `
        <div class="card-img-top d-flex align-items-center justify-content-center" style="height: 200px; background-color: #f0f0f0;">
            <i class="fas fa-image fa-3x text-muted"></i>
        </div>
    `;
    const imageUrl = sticker.imageUrl ? `<img src="${sticker.imageUrl}" class="card-img-top" alt="${sticker.name}">` : imagePlaceholder;
    const duplicateBadge = quantity > 1 ? `<span class="sticker-duplicate">x${quantity}</span>` : '';

    return `
        <div class="col-md-4 col-lg-3 mb-4 sticker-container" data-name="${sticker.name.toLowerCase()}">
            <div class="card sticker-card sticker-owned">
                ${imageUrl}
                ${duplicateBadge}
                <div class="card-body">
                    <h5 class="card-title">${sticker.name}</h5>
                    <p class="card-text small">${sticker.description}</p>
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
    render: async () => {
        try {
            const { data: user } = await getUserProfile();
            const stickers = user.ownedStickers;

            if (stickers.length === 0) {
                return `
                    <div class="text-center">
                        <h2>My Album (${user.username})</h2>
                        <p>Your album is empty. Go to the <a href="/shop" onclick="navigateTo('/shop'); event.preventDefault();">Shop</a> to buy some sticker packs!</p>
                        <p>Credits: ${Math.floor(user.credits)}</p>
                    </div>
                `;
            }

            const stickerCards = stickers.map(createStickerCard).join('');
            const stickerModals = stickers.map(ownedSticker => createStickerModal(ownedSticker.sticker)).join('');

            return `
                <div class="container">
                    <div class="d-flex justify-content-between align-items-center mb-4">
                        <h2>My Album (${user.username})</h2>
                        <h4>Credits: ${Math.floor(user.credits)}</h4>
                    </div>
                    <div class="mb-4">
                        <input type="text" id="album-search-bar" class="form-control" placeholder="Search for a character in your album...">
                    </div>
                    <div class="row">
                        ${stickerCards}
                    </div>
                    ${stickerModals}
                </div>
            `;
        } catch (error) {
            console.error('Error loading album:', error);
            return `<p class="text-danger">Could not load your album. Please try logging in again.</p>`;
        }
    },
    addEventListeners: () => {
        const searchBar = document.getElementById('album-search-bar');
        if (searchBar) {
            searchBar.addEventListener('keyup', () => {
                const searchTerm = searchBar.value.toLowerCase();
                const stickerContainers = document.querySelectorAll('.sticker-container');

                stickerContainers.forEach(container => {
                    const characterName = container.dataset.name;
                    if (characterName.includes(searchTerm)) {
                        container.style.display = '';
                    } else {
                        container.style.display = 'none';
                    }
                });
            });
        }
    }
};