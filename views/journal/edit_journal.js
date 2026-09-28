document.addEventListener('DOMContentLoaded', async function() {
    const form = document.getElementById('editJournalForm');
    
    
    const urlParams = new URLSearchParams(window.location.search);
    const editId = urlParams.get('id') || urlParams.get('edit');

    if (!editId) {
        alert('ID Jurnal tidak ditemukan!');
        window.location.href = 'table_Journal.html';
        return;
    }

    
    try {
        const coaResponse = await fetch('/api/table-glmas'); 
        if (!coaResponse.ok) throw new Error('Endpoint COA tidak ditemukan');
        
        const coaData = await coaResponse.json();
        const coaSelect = document.getElementById('edit_coa');
        
        coaSelect.innerHTML = '<option value="">Pilih COA</option>';
        
        coaData.forEach(item => {
            const option = document.createElement('option');
            option.value = item.noper; 
            option.textContent = `${item.noper} - ${item.naper}`;
            coaSelect.appendChild(option);
        });
    } catch (err) {
        console.error('Gagal memuat data COA:', err);
    }

    
    try {
        const response = await fetch(`/api/table-gltemp_k/${editId}`);
        const data = await response.json();

        if (response.ok) {
            document.getElementById('edit_tanggal').value = data.tanggal ? data.tanggal.split('T')[0] : '';
            document.getElementById('edit_coa').value = data.perkiraan || '';
            document.getElementById('edit_dk').value = data.dk || 'D';
            
            document.getElementById('edit_nilai').value = data.debet > 0 ? data.debet : (data.kredit || 0);
            
            document.getElementById('edit_uraian').value = data.urai || '';
            document.getElementById('edit_user').value = data.user_name || '';
        } else {
            alert(data.error || 'Gagal memuat data untuk diedit');
        }
    } catch (error) {
        console.error('Gagal mengambil data jurnal:', error);
    }

    if (form) {
        form.addEventListener('submit', async function (e) {
            e.preventDefault();

            const dkValue = document.getElementById('edit_dk').value;
            const nominal = document.getElementById('edit_nilai').value;

            const journalData = {
                tanggal: document.getElementById('edit_tanggal').value,
                perkiraan: document.getElementById('edit_coa').value,
                dk: dkValue,
                nilai: nominal,
                urai: document.getElementById('edit_uraian').value,
                user_name: document.getElementById('edit_user').value
            };

            try {
                const response = await fetch(`/api/table-gltemp_k/${editId}`, {
                    method: 'PUT',
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


document.getElementById('logoutBtn').addEventListener('click', function(e) {
    e.preventDefault();
    localStorage.removeItem('user'); 

    window.location.href = '/views/auth/login.html';
});