// Use environment variable or fallback to default
const API_BASE_URL = window.API_BASE_URL || `${window.location.protocol}//${window.location.hostname}:5001/api`;

const request = async (endpoint, method = 'GET', body = null) => {
    console.log(`Making ${method} request to ${API_BASE_URL}${endpoint}`); // Debug log
    
    const headers = { 'Content-Type': 'application/json' };
    const token = getToken();
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
        console.log('Token added to headers'); // Debug log
    } else {
        console.log('No token found'); // Debug log
    }

    const config = {
        method,
        headers,
    };

    if (body) {
        config.body = JSON.stringify(body);
    }

    try {
        console.log('Fetch config:', config); // Debug log
        const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
        
        // Clone the response to log the body, as it can only be read once
        const responseClone = response.clone();
        const responseText = await responseClone.text();
        console.log(`Response status: ${response.status}`);
        console.log(`Response text: ${responseText}`);

        if (!response.ok) {
            let errorData;
            try {
                errorData = JSON.parse(responseText);
            } catch (e) {
                console.error('Failed to parse error response as JSON:', e);
                errorData = { message: `Request failed with status ${response.status}: ${responseText}` };
            }
            console.error('API request failed with non-OK status:', errorData);
            throw errorData;
        }
        
        // If response is OK but body is empty, return a success indicator
        if (response.status === 204 || response.headers.get('content-length') === '0') {
            return { success: true };
        }

        // Try to parse JSON, if it fails, return the raw text
        try {
            return JSON.parse(responseText);
        } catch (e) {
            console.error('Failed to parse response as JSON:', e);
            return { success: true, data: responseText };
        }

    } catch (error) {
        console.error('Fetch API call error:', error);
        // Re-throw the error to be caught by the calling function
        throw error;
    }
};

// AUTH
const loginUser = (credentials) => request('/auth/login', 'POST', credentials);
const registerUser = (userData) => request('/auth/register', 'POST', userData);

// USER
const getUserProfile = () => request('/users/me');
const updateUserProfile = (userData) => request('/users/updatedetails', 'PUT', userData);
const updateUserPassword = (passwordData) => request('/users/updatepassword', 'PUT', passwordData);
const purchaseCredits = (data) => request('/users/credits/purchase', 'POST', data);
const upgradeToAdmin = (adminPassword) => request('/users/upgrade-admin', 'POST', { adminPassword });
const downgradeToUser = () => request('/users/downgrade-admin', 'POST');
const deleteUserProfile = (password) => request('/users/me', 'DELETE', { password });

// STICKERS & PACKS
const getStickerPacks = () => request('/stickers/packs');
const buyPack = (packId, quantity) => request(`/stickers/packs/buy/${packId}`, 'POST', { quantity: Number(quantity) });
const sellSticker = (stickerId) => request('/stickers/sell', 'POST', { stickerId });
const getAllStickers = () => request('/stickers/all');

// TRADES
const getTradeOffers = () => request('/trades');
const createTrade = (tradeData) => request('/trades', 'POST', tradeData);
const acceptTrade = (tradeId) => request(`/trades/${tradeId}/accept`, 'POST');
const cancelTrade = (tradeId) => request(`/trades/${tradeId}`, 'DELETE');

// ADMIN PACKS
const createCustomPack = (packData) => request('/admin/custom-pack', 'POST', packData);
const deleteCustomPack = (packId) => request(`/admin/custom-pack/${packId}`, 'DELETE');

// CHARACTERS
const getCharacterNamesList = () => request('/characters/names', 'GET');

// USER WITH ROLE
const getUserProfileWithRole = () => request('/users/me/role');