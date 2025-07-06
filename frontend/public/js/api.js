const API_BASE_URL = 'http://localhost:5001/api';

const request = async (endpoint, method = 'GET', body = null) => {
    const headers = { 'Content-Type': 'application/json' };
    const token = getToken();
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const config = {
        method,
        headers,
    };

    if (body) {
        config.body = JSON.stringify(body);
    }

    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'An API error occurred');
        }
        return data;
    } catch (error) {
        console.error(`API Error on ${method} ${endpoint}:`, error);
        showToast(error.message, 'danger');
        throw error;
    }
};

// AUTH
const loginUser = (credentials) => request('/auth/login', 'POST', credentials);
const registerUser = (userData) => request('/auth/register', 'POST', userData);

// USER
const getUserProfile = () => request('/users/me');
const purchaseCredits = (data) => request('/users/credits', 'POST', data);

// STICKERS & PACKS
const getStickerPacks = () => request('/stickers/packs');
const buyPack = (packId) => request(`/stickers/packs/buy/${packId}`, 'POST');
const sellSticker = (stickerId) => request('/stickers/sell', 'POST', { stickerId });

// TRADES
const getTradeOffers = () => request('/trades');
const createTrade = (tradeData) => request('/trades', 'POST', tradeData);
const acceptTrade = (tradeId) => request(`/trades/${tradeId}/accept`, 'POST');