document.addEventListener('DOMContentLoaded', async function() {
    const form = document.getElementById('addProductForm');
    
    // Cek apakah ada parameter ?edit=kode di URL
    const urlParams = new URLSearchParams(window.location.search);
    const editKode = urlParams.get('edit');

    // Jika mode edit, ambil data lama dari server lalu tampilkan ke form
    if (editKode) {
        try {
            const response = await fetch(`/api/table-group/${editKode}`);
            const data = await response.json();

            if (response.ok) {
                document.getElementById('add_code').value = data.kode || '';
                document.getElementById('add_name').value = data.nama || '';
                document.getElementById('add_group').value = data.grup || '';
                
                // Opsional: Kunci input kode agar tidak bisa diubah saat mode edit
                document.getElementById('add_code').setAttribute('readonly', true);
            } else {
                alert(data.error || 'Gagal memuat data untuk diedit');
            }
        } catch (error) {
            console.error('Gagal mengambil data:', error);
        }
    }

    if (form) {
        form.addEventListener('submit', async function (e) {
            e.preventDefault();

            // Sesuaikan key dengan yang diminta oleh server.js (kode, nama, grup)
            const productData = {
                kode: document.getElementById('add_code').value,
                nama: document.getElementById('add_name').value,
                grup: document.getElementById('add_group').value,
            };

            // Tentukan URL dan Method: Jika ada editKode pakai PUT, jika tidak pakai POST
            const url = editKode ? `/api/table-group/${editKode}` : '/api/table-group';
            const method = editKode ? 'PUT' : 'POST';

            try {
                const response = await fetch(url, {
                    method: method,
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(productData)
                });

                const result = await response.json();

                if (!response.ok) {
                    alert('Gagal menyimpan: ' + (result.error || 'Terjadi kesalahan'));
                    return;
                }

                alert('Data berhasil disimpan ke database!');
                window.location.href = 'table_group.html';

            } catch (error) {
                console.error('Gagal mengirim data:', error);
                alert('Gagal terhubung ke server.');
            }
        });
    }
});


document.getElementById('logoutBtn').addEventListener('click', function(e) {
    e.preventDefault();
    localStorage.removeItem('user'); 

    window.location.href = '/views/auth/login.html';
});