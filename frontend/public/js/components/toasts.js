// Shared Bootstrap-styled toast utility for all components
function showToast(message, type = 'info', duration = 4000) {
    let container = document.getElementById('site-toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'site-toast-container';
        container.style.position = 'fixed';
        container.style.top = '1rem';
        container.style.right = '1rem';
        container.style.zIndex = '1080';
        container.setAttribute('aria-live', 'polite');
        container.setAttribute('aria-atomic', 'true');
        document.body.appendChild(container);
    }
    const typeClass = {
        success: 'bg-success text-white',
        danger: 'bg-danger text-white',
        error: 'bg-danger text-white',
        warning: 'bg-warning text-dark',
        info: 'bg-info text-dark',
        default: 'bg-secondary text-white'
    }[type] || 'bg-secondary text-white';
    const toast = document.createElement('div');
    toast.className = `toast align-items-center ${typeClass}`;
    toast.setAttribute('role', 'alert');
    toast.setAttribute('aria-live', 'assertive');
    toast.setAttribute('aria-atomic', 'true');
    toast.style.minWidth = '250px';
    toast.style.boxShadow = '0 2px 8px rgba(0,0,0,0.15)';
    toast.innerHTML = `
        <div class="d-flex">
            <div class="toast-body">${message}</div>
            <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
        </div>
    `;
    container.appendChild(toast);
    const bsToast = new bootstrap.Toast(toast, { delay: duration });
    bsToast.show();
    toast.addEventListener('hidden.bs.toast', () => {
        toast.remove();
    });
    toast.querySelector('.btn-close').addEventListener('click', () => {
        bsToast.hide();
    });
}
