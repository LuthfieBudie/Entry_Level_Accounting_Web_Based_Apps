    document.addEventListener('DOMContentLoaded', function() {
        const loginForm = document.getElementById('loginForm');

        if (loginForm) {
            loginForm.addEventListener('submit', async function(e) {
                e.preventDefault();

                const usernameInput = document.getElementById('user_nama').value;
                const passwordInput = document.getElementById('user_password').value;

                try {
                    const response = await fetch('/api/user', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ 
                            user_nama: usernameInput, 
                            user_password: passwordInput
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