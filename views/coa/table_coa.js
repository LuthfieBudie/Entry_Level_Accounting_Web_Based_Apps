async function loadTableData() {
    try {
        let response = await fetch('/api/table-chart_of_accounts');
        let rows = await response.json();

        let tableBody = document.getElementById('table-body');
        if (!tableBody) return;

        tableBody.innerHTML = '';

        rows.forEach(item => {
            let tr = document.createElement('tr');
            tr.style.borderBottom = '1px solid #e2e8f0';

            tr.innerHTML = `
                <td style="padding: 12px;">${item.kode}</td>
                <td style="padding: 12px; font-weight: 500;">${item.nama}</td>
                <td style="padding: 12px;">${item.rl}</td>
                <td style="padding: 12px;">${item.grup} - ${item.nama_grup || ''}</td>
                <td style="padding: 12px;">${item.level}</td>
                <td style="padding: 12px;">${item['saldo_debet']}</td>
                <td style="padding: 12px;">${item['saldo_kredit']}</td>
                <td style="padding: 12px;">
                    <button onclick="editData('${item.kode}')" style="background: #3b82f6; color: white; border: none; padding: 6px 10px; border-radius: 4px; cursor: pointer; margin-right: 5px;">Edit</button>
                    <button onclick="deleteData('${item.kode}')" style="background: #ef4444; color: white; border: none; padding: 6px 10px; border-radius: 4px; cursor: pointer;">Hapus</button>
                </td>
            `;

            tableBody.appendChild(tr);
        });
    } catch (error) {
        console.error('Gagal memuat data tabel:', error);
    }
}

document.addEventListener('DOMContentLoaded', function () {
    loadTableData();
});

// Fungsi untuk Edit (Mengarahkan ke form dengan membawa parameter kode)
function editData(kode) {
    window.location.href = `edit_coa.html?edit=${kode}`;
}

// Fungsi untuk Hapus data dari database
async function deleteData(kode) {
    if (confirm(`Apakah kamu yakin ingin menghapus data dengan kode ${kode}?`)) {
        try {
            const response = await fetch(`/api/table-chart_of_accounts/${kode}`, {
                method: 'DELETE'
            });
            const result = await response.json();

            if (response.ok) {
                alert('Data berhasil dihapus');
                loadTableData(); // 
            } else {
                alert(result.error || 'Gagal menghapus data');
            }
        } catch (error) {
            console.error('Error saat menghapus:', error);
            alert('Terjadi kesalahan koneksi ke server.');
        }
    }
}

document.getElementById('logoutBtn').addEventListener('click', function(e) {
    e.preventDefault();
    localStorage.removeItem('user'); 

    window.location.href = '/views/auth/login.html';
});