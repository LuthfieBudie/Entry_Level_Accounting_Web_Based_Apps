document.addEventListener('DOMContentLoaded', async function() {
    const form = document.getElementById('editCoaForm'); // Sesuaikan dengan id form Anda
    const urlParams = new URLSearchParams(window.location.search);
    const editKode = urlParams.get('edit');

    // Jika ada parameter edit, berarti mode EDIT
    if (editKode) {
        document.querySelector('.dashboard_title').innerHTML = 'Edit Chart Of Accounts <a href="add_coa.html" class="fa-solid fa-arrows-rotate"></a>';
        
        try {
            const response = await fetch(`/api/table-glmas/${editKode}`);
            const data = await response.json();

            if (response.ok) {
                document.getElementById('edit_noper').value = data.noper || '';
                document.getElementById('edit_naper').value = data.naper || '';
                document.getElementById('edit_klmpk').value = data.klmpk || '';
                document.getElementById('edit_awald').value = data.awald || 0;
                document.getElementById('edit_awalk').value = data.awalk || 0;
                document.getElementById('edit_level').value = data.level || '';
                document.getElementById('edit_grup').value = data.grup || '';
            } else {
                alert(data.error || 'Gagal memuat data untuk diedit');
            }
        } catch (error) {
            console.error('Gagal mengambil data:', error);
        }
    } else {
        // Jika TIDAK ADA parameter edit, berarti mode TAMBAH BARU
        document.querySelector('.dashboard_title').innerHTML = 'Tambah Chart Of Accounts <a href="add_coa.html" class="fa-solid fa-arrows-rotate"></a>';
    }

    if (form) {
        form.addEventListener('submit', async function (e) {
            e.preventDefault();

            const coaData = {
                noper: document.getElementById('edit_noper').value,
                naper: document.getElementById('edit_naper').value,
                klmpk: document.getElementById('edit_klmpk').value,
                awald: document.getElementById('edit_awald').value,
                awalk: document.getElementById('edit_awalk').value,
                level: document.getElementById('edit_level').value,
                grup: document.getElementById('edit_grup').value,
            };

            // Tentukan URL dan Method berdasarkan mode (Edit atau Tambah)
            const url = editKode ? `/api/table-glmas/${editKode}` : '/api/table-glmas';
            const method = editKode ? 'PUT' : 'POST';

            try {
                const response = await fetch(url, {
                    method: method,
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(coaData)
                });

                const result = await response.json();

                if (!response.ok) {
                    alert('Gagal memproses: ' + (result.error || 'Terjadi kesalahan'));
                    return;
                }

                alert(editKode ? 'Data berhasil diperbarui!' : 'Data berhasil ditambahkan!');
                window.location.href = '/views/coa/table_Coa.html';

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