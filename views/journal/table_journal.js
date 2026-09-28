







const JENIS_TRANSAKSI = 'KM'; 

document.addEventListener("DOMContentLoaded", function() {
    loadCoaDropdown();
    loadTableData();
    loadCurrentUser();

    const productForm = document.getElementById('addProductForm');
    if (productForm) {
        productForm.addEventListener('submit', async function(e) {
            e.preventDefault();

            const tanggal = document.getElementById('add_tanggal').value;
            const perkiraan = document.getElementById('add_coa').value;
            const dk = document.getElementById('add_dk').value;
            const urai = document.getElementById('add_uraian').value;
            const nilai = document.getElementById('add_nilai').value;
            const user_name = document.getElementById('add_user').value;

            const payload = { 
                tanggal, 
                perkiraan, 
                dk, 
                urai, 
                nilai, 
                user_name, 
                jenis_prefix: JENIS_TRANSAKSI 
            };

            try {
                const response = await fetch('/api/table-gltemp_k', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });

                const result = await response.json();

                if (response.ok) {
                    alert('Data berhasil disimpan!');
                    productForm.reset(); 
                    loadCurrentUser();   
                    loadTableData();
                } else {
                    alert(result.error || 'Gagal menyimpan data.');
                }
            } catch (err) {
                console.error('Terjadi kesalahan:', err);
                alert('Terjadi kesalahan koneksi ke server.');
            }
        });
    }
});

function loadCoaDropdown() {
    fetch('/api/coa')
        .then(response => response.json())
        .then(data => {
            const selectCoa = document.getElementById('add_coa');
            if (!selectCoa) return;
            selectCoa.innerHTML = '<option value="">Pilih Perkiraan</option>';
            data.forEach(item => {
                const option = document.createElement('option');
                option.value = item.noper; 
                option.textContent = `${item.noper} - ${item.naper}`; 
                selectCoa.appendChild(option);
            });
        })
        .catch(error => console.error('Gagal memuat data COA:', error));
}

async function handlePosting() {
    if (!confirm('Apakah Anda yakin ingin memposting transaksi ini?')) return;

    try {
        // Kirim jenis transaksi ke endpoint posting agar diproses sesuai prefix-nya
        const response = await fetch('/api/posting', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ jenis_prefix: JENIS_TRANSAKSI })
        });

        const result = await response.json();

        if (response.ok) {
            alert(result.message || 'Posting berhasil!');
            loadTableData();
        } else {
            alert(result.error || 'Gagal melakukan posting.');
        }
    } catch (error) {
        console.error('Terjadi kesalahan koneksi:', error);
        alert('Terjadi kesalahan koneksi ke server.');
    }
}

async function loadTableData() {
    try {
        // Ambil data berdasarkan parameter jenis (KK atau KM)
        let [jurnalResponse, coaResponse] = await Promise.all([
            fetch(`/api/table-gltemp_k?jenis=${JENIS_TRANSAKSI}`),
            fetch('/api/table-glmas') 
        ]);
        
        let rows = await jurnalResponse.json();
        let coaList = await coaResponse.json();

        let tableBody = document.getElementById('table-body');
        if (!tableBody) return;

        if (!Array.isArray(rows)) {
            tableBody.innerHTML = `<tr><td colspan="12" style="text-align:center; color: red; padding: 15px;">Error dari Server</td></tr>`;
            return;
        }

        let coaMap = {};
        if (Array.isArray(coaList)) {
            coaList.forEach(c => {
                coaMap[String(c.noper).trim()] = c.naper;
            });
        }

        let htmlContent = `
            <tr>
                <th style="padding: 12px; text-align: left;">ID</th>
                <th style="padding: 12px; text-align: left;">Bukti</th>
                <th style="padding: 12px; text-align: left;">Tanggal</th>
                <th style="padding: 12px; text-align: left;">Perkiraan</th>
                <th style="padding: 12px; text-align: left;">Jenis</th>
                <th style="padding: 12px; text-align: center;">DK</th>
                <th style="padding: 12px; text-align: left;">Urai</th>
                <th style="padding: 12px; text-align: right;">Debet</th>
                <th style="padding: 12px; text-align: right;">Kredit</th>
                <th style="padding: 12px; text-align: left;">User Name</th>
                <th style="padding: 12px; text-align: left;">Logtime</th>
                <th style="padding: 12px; text-align: center;">Aksi</th>
            </tr>
        `;

        if (rows.length === 0) {
            htmlContent += `<tr><td colspan="12" style="text-align:center; padding: 15px;">Tidak ada data ditemukan</td></tr>`;
            tableBody.innerHTML = htmlContent;
            return;
        }

        let totaldebet = 0;
        let totalkredit = 0;

        rows.forEach(item => {
            let debetVal = parseFloat(item.debet) || 0;
            let kreditVal = parseFloat(item.kredit) || 0;
            totaldebet += debetVal;
            totalkredit += kreditVal;

            let kodePerkiraan = item.perkiraan ? String(item.perkiraan).trim() : '';
            let namaCoa = coaMap[kodePerkiraan] ? `${kodePerkiraan} - ${coaMap[kodePerkiraan]}` : kodePerkiraan;

            htmlContent += `
                <tr style="border-bottom: 1px solid #e2e8f0;">
                    <td style="padding: 12px;">${item.id}</td>
                    <td style="padding: 12px; font-weight: 500;">${item.bukti || '-'}</td>
                    <td style="padding: 12px;">${item.tanggal ? item.tanggal.split('T')[0] : ''}</td>
                    <td style="padding: 12px;">${namaCoa}</td>
                    <td style="padding: 12px;">${item.jenis || '-'}</td>
                    <td style="padding: 12px; text-align: center;">${item.dk || '-'}</td>
                    <td style="padding: 12px;">${item.urai || '-'}</td>
                    <td style="padding: 12px; text-align: right;">${debetVal.toLocaleString('id-ID')}</td>
                    <td style="padding: 12px; text-align: right;">${kreditVal.toLocaleString('id-ID')}</td>
                    <td style="padding: 12px;">${item.user_name || '-'}</td>
                    <td style="padding: 12px;">${item.logtime || '-'}</td>
                    <td style="padding: 12px; text-align: center; white-space: nowrap;">
                        <button onclick="editData('${item.id}')" style="background: #3b82f6; color: white; border: none; padding: 6px 10px; border-radius: 4px; cursor: pointer;">Edit</button>
                        <button onclick="deleteData('${item.id}')" style="background: #ef4444; color: white; border: none; padding: 6px 10px; border-radius: 4px; cursor: pointer;">Hapus</button>
                    </td>
                </tr>
            `;
        });

        htmlContent += `
            <tr style="font-weight: bold; background: #f8fafc;">
                <td colspan="7" style="padding: 12px; text-align: right;">TOTAL:</td>
                <td style="padding: 12px; text-align: right;">${totaldebet.toLocaleString('id-ID')}</td>
                <td style="padding: 12px; text-align: right;">${totalkredit.toLocaleString('id-ID')}</td>
                <td colspan="3" style="padding: 12px;"></td>
            </tr>
        `; 

        tableBody.innerHTML = htmlContent;

    } catch (error) {
        console.error('Gagal memuat data tabel:', error);
    }
}

function loadCurrentUser() {
    const inputUser = document.getElementById('add_user');
    if (!inputUser) return;
    const userDataString = localStorage.getItem('user');
    if (userDataString) {
        try {
            const userObj = JSON.parse(userDataString);
            inputUser.value = userObj.user_nama || 'Administrator';
        } catch (e) {
            inputUser.value = 'Administrator';
        }
    } else {
        inputUser.value = 'Administrator'; 
    }
}








function editData(id) {
    window.location.href = `edit_journal.html?edit=${id}`;
}









async function deleteData(id) {
    if (!confirm('Hapus baris ini?')) return;
    try {
        const response = await fetch(`/api/table-gltemp_k/${id}`, { method: 'DELETE' });
        if (response.ok) loadTableData();
        else alert('Gagal menghapus data.');
    } catch (err) {
        alert('Terjadi kesalahan koneksi.');
    }
}







document.getElementById('logoutBtn').addEventListener('click', function(e) {
    e.preventDefault();
    localStorage.removeItem('user'); 

    window.location.href = '/views/auth/login.html';
});