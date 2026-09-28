async function loadTableData() {
    try {
        let response = await fetch('/api/table-glmas');
        let rows = await response.json();

        let tableBody = document.getElementById('table-body');
        if (!tableBody) return;

        tableBody.innerHTML = '';

        rows.forEach(item => {
            let tr = document.createElement('tr');
            tr.style.borderBottom = '1px solid #e2e8f0';

            tr.innerHTML = `
                <td style="padding: 12px;">${item.noper}</td>
                <td style="padding: 12px;">${item.naper}</td>
                <td style="padding: 12px;">${item.klmpk}</td>
                <td style="padding: 12px;">${item.awald}</td>
                <td style="padding: 12px;">${item.awalk}</td>
                <td style="padding: 12px;">${item.level}</td>
                <td style="padding: 12px;">${item.grup}</td>
                <td style="padding: 12px;">
                    <button onclick="editData('${item.noper}')" style="background: #3b82f6; color: white; border: none; padding: 6px 10px; border-radius: 4px; cursor: pointer; margin-right: 5px;">Edit</button>
                    <button onclick="deleteData('${item.noper}')" style="background: #ef4444; color: white; border: none; padding: 6px 10px; border-radius: 4px; cursor: pointer;">Hapus</button>
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
function editData(noper) {
    window.location.href = `edit_coa.html?edit=${noper}`;
}

// Fungsi untuk Hapus data dari database
async function deleteData(noper) {
    if (confirm(`Apakah kamu yakin ingin menghapus data dengan kode ${noper}?`)) {
        try {
            const response = await fetch(`/api/table-glmas/${noper}`, {
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