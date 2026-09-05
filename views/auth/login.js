document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');

    if (loginForm) {
        loginForm.addEventListener('submit', async function(e) {
            e.preventDefault();

            const usernameInput = document.getElementById('username').value;
            const passwordInput = document.getElementById('password').value;

            try {
                const response = await fetch('/api/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ 
                        username: usernameInput, 
                        password: passwordInput 
                    })
                });

                const result = await response.json();

                if (response.ok) {
                    alert('Login berhasil!');
                    localStorage.setItem('user', JSON.stringify(result.user));
                    window.location.href = '/views/dashboard/dashboard.html';
                } else {
                    alert(result.error || 'Username atau password salah!');
                }

            } catch (error) {
                console.error('Gagal login:', error);
                alert('Terjadi kesalahan koneksi ke server.');
            }
        });
    }
});