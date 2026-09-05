document.addEventListener('DOMContentLoaded', async function() {
    const form = document.getElementById('editJournalForm');
    
    // 1. Ambil parameter ?edit=id dari URL
    const urlParams = new URLSearchParams(window.location.search);
    const editId = urlParams.get('edit');

    // 2. Muat pilihan dropdown COA terlebih dahulu (opsional tapi penting agar select tidak kosong)
    try {
        const coaResponse = await fetch('/api/table-chart_of_accounts');
        const coaData = await coaResponse.json();
        const coaSelect = document.getElementById('edit_coa');
        
        coaData.forEach(item => {
            const option = document.createElement('option');
            option.value = item.kode;
            option.textContent = `${item.kode} - ${item.nama}`;
            coaSelect.appendChild(option);
        });
    } catch (err) {
        console.error('Gagal memuat data COA:', err);
    }

    // 3. Jika ada ID edit, ambil data jurnal lama dari server lalu tampilkan ke form
    if (editId) {
        try {
            const response = await fetch(`/api/table-gltemp_k/${editId}`);
            const data = await response.json();

            if (response.ok) {
                document.getElementById('edit_id').value = data.id || '';
                document.getElementById('edit_tanggal').value = data.tanggal ? data.tanggal.split('T')[0] : '';
                document.getElementById('edit_coa').value = data.coa || '';
                document.getElementById('edit_dk').value = data.dk || 'D';
                
                // Menangani nilai debet / kredit (jika salah satu 0, ambil yang aktif)
                document.getElementById('edit_nilai').value = data.debet > 0 ? data.debet : (data.kredit || 0);
                
                document.getElementById('edit_uraian').value = data.uraian || '';
                document.getElementById('edit_user').value = data.user || '';
            } else {
                alert(data.error || 'Gagal memuat data untuk diedit');
            }
        } catch (error) {
            console.error('Gagal mengambil data jurnal:', error);
        }
    }

    // 4. Proses simpan perubahan saat form disubmit
    if (form) {
        form.addEventListener('submit', async function (e) {
            e.preventDefault();

            const dkValue = document.getElementById('edit_dk').value;
            const nominal = document.getElementById('edit_nilai').value;

            // Sesuaikan struktur kolom dengan database jurnal kamu
            const journalData = {
                tanggal: document.getElementById('edit_tanggal').value,
                coa: document.getElementById('edit_coa').value,
                dk: dkValue,
                debet: dkValue === 'D' ? nominal : 0,
                kredit: dkValue === 'K' ? nominal : 0,
                uraian: document.getElementById('edit_uraian').value,
                user: document.getElementById('edit_user').value
            };

            const url = editId ? `/api/table-gltemp_k/${editId}` : '/api/table-gltemp_k';
            const method = editId ? 'PUT' : 'POST';

            try {
                const response = await fetch(url, {
                    method: method,
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(journalData)
                });

                const result = await response.json();

                if (!response.ok) {
                    alert('Gagal menyimpan: ' + (result.error || 'Terjadi kesalahan'));
                    return;
                }

                alert('Data jurnal berhasil diperbarui!');
                window.location.href = 'table_Journal.html';

            } catch (error) {
                console.error('Gagal mengirim data:', error);
                alert('Gagal terhubung ke server.');
            }
        });
    }
});

// Tombol Logout
const logoutBtn = document.getElementById('logoutBtn');
if (logoutBtn) {
    logoutBtn.addEventListener('click', function(e) {
        e.preventDefault();
        localStorage.removeItem('user'); 
        window.location.href = '/views/auth/login.html';
    });
}