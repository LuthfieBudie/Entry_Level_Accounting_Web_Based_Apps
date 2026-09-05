async function loadTableData() {
    try {
        let [jurnalResponse, coaResponse] = await Promise.all([
            fetch('/api/table-gltemp_k'),
            fetch('/api/table-chart_of_accounts')
        ]);
        let rows = await jurnalResponse.json();
        let coaList = await coaResponse.json();

        let coaMap = {};
        coaList.forEach(c => {
            coaMap[c.kode] = c.nama;
        });

        let tableBody = document.getElementById('table-body');
        if (!tableBody) return;

        tableBody.innerHTML = '';

        let totaldebet = 0;
        let totalkredit = 0;

        rows.forEach(item => {
            let tr = document.createElement('tr');
            tr.style.borderBottom = '1px solid #e2e8f0';

            let tanggalBersih = item.tanggal ? item.tanggal.split('T')[0] : '';
            let logtimeBersih = '';

            totaldebet += parseFloat(item.debet) || 0;
            totalkredit += parseFloat(item.kredit) || 0;

            if (item.logtime) { 
                const dateUTC = new Date(item.logtime.endsWith('Z') ? item.logtime : item.logtime + 'Z'); 
                logtimeBersih = dateUTC.toLocaleString('id-ID', { 
                    timeZone: 'Asia/Jakarta', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' 
                }); 
            }

            let namaCoa = coaMap[item.coa] ? `${item.coa} - ${coaMap[item.coa]}` : item.coa;

            tr.innerHTML = `
                <td style="padding: 12px;">${item.id}</td>
                <td style="padding: 12px; font-weight: 500;">${tanggalBersih}</td>
                <td style="padding: 12px;">${namaCoa}</td>
                <td style="padding: 12px;">${item.dk}</td>
                <td style="padding: 12px;">${item.debet}</td>
                <td style="padding: 12px;">${item.kredit}</td>
                <td style="padding: 12px;">${item.uraian}</td>
                <td style="padding: 12px;">${item.user}</td>
                <td style="padding: 12px;">${logtimeBersih}</td>
                <td style="padding: 12px;">
                    <button onclick="editData('${item.id}')" style="background: #3b82f6; color: white; border: none; padding: 6px 10px; border-radius: 4px; cursor: pointer; margin-right: 5px;">Edit</button>
                    <button onclick="deleteData('${item.id}')" style="background: #ef4444; color: white; border: none; padding: 6px 10px; border-radius: 4px; cursor: pointer;">Hapus</button>
                </td>
            `;

            tableBody.appendChild(tr);
        });


        let trtotal = document.createElement('tr');
        trtotal.innerHTML = `
        <td colspan="4" style="padding: 12px; text-align: right;">TOTAL:</td>
        <td style="padding: 12px;">${totaldebet}</td>
        <td style="padding: 12px;">${totalkredit}</td>
        <td colspan="3" style="padding: 12px;"></td>
    `;
    tableBody.appendChild(trtotal);





    } catch (error) {
        console.error('Gagal memuat data tabel:', error);
    }
}

async function deleteData(id) {
    if (confirm(`Apakah kamu yakin ingin menghapus data dengan ID ${id}?`)) {
        try {
            let response = await fetch(`/api/table-gltemp_k/${id}`, {
                method: 'DELETE'
            });
            let result = await response.json();
            
            if (response.ok) {
                alert('Data berhasil dihapus!');
                loadTableData(); 
            } else {
                alert(result.error || 'Gagal menghapus data');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Gagal terhubung ke server.');
        }
    }
}

function editData(id) {
    window.location.href = `edit_journal.html?edit=${id}`;
}

document.addEventListener('DOMContentLoaded', function () {
    loadTableData();
});

document.getElementById('logoutBtn').addEventListener('click', function(e) {
    e.preventDefault();
    localStorage.removeItem('user'); 
    window.location.href = '/views/auth/login.html';
});

document.addEventListener('DOMContentLoaded', async function() {
    const form = document.getElementById('addProductForm');
    const groupSelect = document.getElementById('add_coa');
    const storedUser = localStorage.getItem('user');
    const userInput = document.getElementById('add_user');

    if (userInput && storedUser) {
        const userData = JSON.parse(storedUser);
        userInput.value = userData.username; 
        userInput.readOnly = true; 
        userInput.style.backgroundColor = '#e2e8f0';
        userInput.style.cursor = 'not-allowed';
    }

    try {
        const groupResponse = await fetch('/api/table-chart_of_accounts');
        const groups = await groupResponse.json();

        if (groupResponse.ok && groupSelect) {
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

    if (form) {
        form.addEventListener('submit', async function (e) {
            e.preventDefault();
            const pilihanDK = document.getElementById('add_dk').value;
            const nilaiInput = document.getElementById('add_nilai').value;

            const autoVoucher = 'VCR-' + Date.now();
            const rawInput = document.getElementById('add_tanggal').value;
            
            let formattedTanggal = rawInput;
            if (rawInput) {
                const dateObj = new Date(rawInput);
                dateObj.setMinutes(dateObj.getMinutes() - dateObj.getTimezoneOffset());
                formattedTanggal = dateObj.toISOString().split('T')[0];
            }

            const newProduct = {
                voucher: autoVoucher, 
                tanggal: formattedTanggal,
                coa: document.getElementById('add_coa').value,
                dk: pilihanDK,
                debet: pilihanDK === 'D' ? nilaiInput : 0,
                kredit: pilihanDK === 'K' ? nilaiInput : 0,
                uraian: document.getElementById('add_uraian').value,
                user: userInput ? userInput.value : ''
            };

            try {
                const response = await fetch('/api/table-gltemp_k', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(newProduct)
                });

                const result = await response.json();

                if (!response.ok) {
                    alert('Gagal menyimpan: ' + (result.error || 'Terjadi kesalahan'));
                    return;
                }

                alert('Data berhasil disimpan ke database!');
                
                loadTableData(); 
                form.reset();    
                
                if (storedUser && userInput) {
                    userInput.value = JSON.parse(storedUser).username;
                }

            } catch (error) {
                console.error('Gagal mengirim data:', error);
                alert('Gagal terhubung ke server.');
            }
        });
    }
});



document.addEventListener('DOMContentLoaded', function () {
    const postingBtn = document.querySelector('.posting_btn');

    if (postingBtn) {
        postingBtn.addEventListener('click', async function (e) {
            e.preventDefault();

            try {
                const jurnalResponse = await fetch('/api/table-gltemp_k');
                const rows = await jurnalResponse.json(); 
                
                if (!rows || rows.length === 0){
                    alert('Tidak ada data yang dapat diposting');
                    return;
                }


                let totaldebet = 0;
                let totalkredit = 0;
                let balance ={};

                rows.forEach(item => {
                    let debet = parseFloat(item.debet) || 0;
                    let kredit = parseFloat(item.kredit) || 0;

                    let key = `${item.coa} - ${item.uraian}`;
                    if (!balance[key]) {
                        balance[key] = { debet: 0, kredit: 0 };
                    }
                    balance[key].debet += debet;
                    balance[key].kredit += kredit;
                });

                if (totaldebet !== totalkredit) {
                    alert(`Debet dan Kredit belum balance.`);
                    return; 
                }

                for (let [key, val] of Object.entries(balance)) {
                    if (val.debet !== val.kredit) {
                        alert(`Uraian belum sesuai.`);
                        return;
                    }
                }

                if (!confirm('Apakah Anda yakin ingin memposting semua data ini?')) {
                    return;
                }

                const response = await fetch('/api/posting-gltemp', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' }
                });

                const result = await response.json();

                if (!response.ok) {
                    alert('Gagal posting: ' + (result.error || 'Terjadi kesalahan'));
                    return;
                }

                alert(result.message);
                loadTableData(); 
            } catch (error) {
                console.error('Error:', error);
                alert('Gagal terhubung ke server.');
            }
        });
    }
});





function printPDF() {
    let tableBody = document.getElementById('table-body');
    if (!tableBody || tableBody.rows.length <= 1) {
        alert('Tidak ada data untuk dicetak!');
        return;
    }
    
    window.print();
}








const today = new Date().toISOString().split('T')[0];
    document.getElementById('add_tanggal').value = today;

    