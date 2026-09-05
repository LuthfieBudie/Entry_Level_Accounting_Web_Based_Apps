document.addEventListener('DOMContentLoaded', async function() {
    const form = document.getElementById('addProductForm');
    const groupSelect = document.getElementById('add_group');

    try {
        const groupResponse = await fetch('/api/table-group');
        const groups = await groupResponse.json();

        if (groupResponse.ok) {
            groups.forEach(item => {
                const option = document.createElement('option');
                option.value = item.kode;
                option.textContent = `${item.kode} - ${item.nama}`; 
                groupSelect.appendChild(option);
            });
        }
    } catch (error) {
        console.error('Gagal memuat data group:', error);
    }
    
    const urlParams = new URLSearchParams(window.location.search);
    const editKode = urlParams.get('edit');

    if (editKode) {
        try {
            const response = await fetch(`/api/table-chart_of_accounts/${editKode}`);
            const data = await response.json();

            if (response.ok) {
                document.getElementById('add_code').value = data.kode || '';
                document.getElementById('add_name').value = data.nama || '';
                document.getElementById('add_rl').value = data.rl || '';
                groupSelect.value = data.grup || ''; 
                document.getElementById('add_level').value = data.level || '';
                document.getElementById('add_debit_balance').value = data.saldo_debet || 0;
                document.getElementById('add_credit_balance').value = data.saldo_kredit || 0;
                
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

            const productData = {
                kode: document.getElementById('add_code').value,
                nama: document.getElementById('add_name').value,
                rl: document.getElementById('add_rl').value,
                grup: groupSelect.value,
                level: document.getElementById('add_level').value,
                saldo_debet: document.getElementById('add_debit_balance').value,
                saldo_kredit: document.getElementById('add_credit_balance').value,
            };

            const url = editKode ? `/api/table-chart_of_accounts/${editKode}` : '/api/table-chart_of_accounts';
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
                window.location.href = 'table_Coa.html';

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