async function loadTableData() {
    try {
        let response = await fetch('/api/table-group');
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
                <td style="padding: 12px;">${item.grup}</td>
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

async function deleteData(kode) {
    if (confirm(`Apakah kamu yakin ingin menghapus data dengan kode ${kode}?`)) {
        try {
            let response = await fetch(`/api/table-group/${kode}`, {
                method: 'DELETE'
            });
            let result = await response.json();
            
            if (response.ok) {
                alert('Data berhasil dihapus!');
                loadTableData(); // Muat ulang tabel agar data terupdate
            } else {
                alert(result.error || 'Gagal menghapus data');
            }
        } catch (error) {
            console.error('Error:', error);
        }
    }
}

function editData(kode) {
    window.location.href = `edit_group.html?edit=${kode}`;
}

document.addEventListener('DOMContentLoaded', function () {
    loadTableData();
});

document.getElementById('logoutBtn').addEventListener('click', function(e) {
    e.preventDefault();
    localStorage.removeItem('user'); 

    window.location.href = '/views/auth/login.html';
});