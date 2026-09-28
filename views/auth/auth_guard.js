document.addEventListener('DOMContentLoaded', function() {
    const user = localStorage.getItem('user');
    
    if (!user) {
        window.location.href = '/views/auth/login.html';
        return;
    }

    const btnLogout = document.getElementById('btnLogout');
    if (btnLogout) {
        btnLogout.addEventListener('click', function() {
            localStorage.removeItem('user');
            window.location.href = '/views/auth/login.html';
        });
    }
});

window.pageshow = function(event) {
    if (event.persisted) {
        window.location.reload();
    }
};