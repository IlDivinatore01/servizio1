// A simple client-side router
const navigateTo = (path) => {
    window.location.hash = path;
};

const getToken = () => localStorage.getItem('authToken');
const setToken = (token) => localStorage.setItem('authToken', token);
const removeToken = () => localStorage.removeItem('authToken');