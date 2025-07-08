const AuthPage = {
    render: () => {
        // This component will now decide which form to show based on the hash
        const isLogin = window.location.hash === '#/login';
        return isLogin ? LoginPage.render() : RegisterPage.render();
    },
    addEventListeners: () => {
        const isLogin = window.location.hash === '#/login';
        if (isLogin) {
            LoginPage.addEventListeners();
        } else {
            RegisterPage.addEventListeners();
        }
    }
};