document.addEventListener('DOMContentLoaded', async function () {
    const groupSelect = document.getElementById('add_coa');
    const form = document.getElementById('addProductForm');

    const inputDari = document.getElementById('add_tanggal');
    const inputSampai = document.getElementById('add_to_tanggal');

    const today = new Date().toISOString().split('T')[0];

    
    let groups = [];

    try {
        const groupResponse = await fetch('/api/table-chart_of_accounts');
        groups = await groupResponse.json();

        if (groupResponse.ok && groupSelect) {
            groups.forEach(item => {
                const option = document.createElement('option');
                option.value = item.kode; 
                option.textContent = `${item.kode} - ${item.nama}`; 
                groupSelect.appendChild(option);
            });
        }
    } catch (error) {
        console.error('Gagal memuat data master COA:', error);
    }

    if (form) {
        form.addEventListener('submit', async function (e) {
            e.preventDefault();

            const dariTanggal = inputDari.value;
            const sampaiTanggal = inputSampai.value;
            const selectedCoa = groupSelect.value;

            if (!dariTanggal || !sampaiTanggal) {
                alert('Silakan tentukan rentang tanggal terlebih dahulu!');
                return;
            }

            let url = `/api/buku-besar?dari_tanggal=${dariTanggal}&sampai_tanggal=${sampaiTanggal}`;
            if (selectedCoa) {
                url += `&coa=${selectedCoa}`;
            }

            try {
                const response = await fetch(url);
                const results = await response.json();

                if (!response.ok) {
                    alert(results.error || 'Gagal memuat data filter');
                    return;
                }

                renderTableData(results, dariTanggal, sampaiTanggal, groups, selectedCoa);

            } catch (error) {
                console.error('Error:', error);
                alert('Gagal terhubung ke server.');
            }
        });
    }
});




















function renderTableData(rows, dariTanggal, sampaiTanggal, groups, selectedCoa) {
    let tableBody = document.getElementById('table-body'); 
    if (!tableBody) return;

    tableBody.innerHTML = '';

    let coaText = 'semua Coa'
    if (selectedCoa) {
        let foundCoa = groups ? groups.find(g => g.kode == selectedCoa) : null;
        coaText = foundCoa ? `${foundCoa.kode} - ${foundCoa.nama}` : selectedCoa;
    }

    let trInfo = document.createElement('tr');
    trInfo.innerHTML = `
        <td colspan="10" style="padding: 12px; background: #f8fafc; font-weight: bold; text-align: center;">
            Periode Tanggal: ${dariTanggal || '-'} s/d ${sampaiTanggal || '-'}<br>
            COA: ${coaText}
        </td>
    `;
    tableBody.appendChild(trInfo);

    if (rows.length === 0) {
        let trEmpty = document.createElement('tr');
        trEmpty.innerHTML = `<td colspan="10" style="text-align:center; padding: 15px;">Tidak ada data ditemukan</td>`;
        tableBody.appendChild(trEmpty);
        return;
    }

    let totaldebet = 0;
    let totalkredit = 0;

    rows.forEach(item => {
        let tr = document.createElement('tr');
        tr.style.borderBottom = '1px solid #e2e8f0';

        let foundCoa = groups ? groups.find(g => g.kode == item.coa) : null;
        let textCoa = foundCoa ? `${foundCoa.kode} - ${foundCoa.nama}` : item.coa;

        totaldebet += parseFloat(item.debet) || 0;
        totalkredit += parseFloat(item.kredit) || 0;

        tr.innerHTML = `
            <td style="padding: 12px;">${item.id}</td>
            <td style="padding: 12px;">${item.tanggal}</td>
            <td style="padding: 12px;">${item.voucher}</td>
            <td style="padding: 12px;">${textCoa}</td>
            <td style="padding: 12px;">${item.dk}</td>
            <td style="padding: 12px;">${item.debet}</td>
            <td style="padding: 12px;">${item.kredit}</td>
            <td style="padding: 12px;">${item.uraian}</td>
            <td style="padding: 12px;">${item.user}</td>
            <td style="padding: 12px;">
                <button onclick="editData('${item.id}')" style="background: #3b82f6; color: white; border: none; padding: 6px 10px; border-radius: 4px; cursor: pointer; margin-right: 5px;">Edit</button>
                <button onclick="deleteData('${item.id}')" style="background: #ef4444; color: white; border: none; padding: 6px 10px; border-radius: 4px; cursor: pointer;">Hapus</button>
            </td>
        `;
        tableBody.appendChild(tr);
        
    });

    let trtotal = document.createElement('tr');
        trtotal.innerHTML = `
        <td colspan="5" style="padding: 12px; text-align: right;">TOTAL:</td>
        <td style="padding: 12px;">${totaldebet}</td>
        <td style="padding: 12px;">${totalkredit}</td>
        <td colspan="3" style="padding: 12px;"></td>
    `;
    tableBody.appendChild(trtotal);
}














function editData(id) {
    window.location.href = `edit_buku_besar.html?edit=${id}`;
}

async function deleteData(id) {
    if (confirm(`Apakah kamu yakin ingin menghapus data dengan kode ${id}?`)) {
        try {
            const response = await fetch(`/api/table-gltemp_h/${id}`, {
                method: 'DELETE'
            });
            const result = await response.json();

            if (response.ok) {
                alert('Data berhasil dihapus');
            } else {
                alert(result.error || 'Gagal menghapus data');
            }
        } catch (error) {
            console.error('Error saat menghapus:', error);
            alert('Terjadi kesalahan koneksi ke server.');
        }
    }
}















function printPDF() {
    let tableBody = document.getElementById('table-body');
    if (!tableBody || tableBody.rows.length <= 1) {
        alert('Tidak ada data untuk dicetak!');
        return;
    }
    
    window.print();
}











function exportToExcel() {
    let table = document.getElementById('table-body');
    if (!table || table.rows.length <= 1) {
        alert('Tidak ada data untuk diexport!');
        return;
    }

    let dataToExport = [];

    let infoRow = table.rows[0];
    if (infoRow) {
        dataToExport.push([infoRow.innerText.trim()]);
        dataToExport.push([]); 
    }

    let headers = ['ID', 'Tanggal', 'Voucher', 'COA', 'D/K', 'Debet', 'Kredit', 'Uraian', 'User'];
    dataToExport.push(headers);

    for (let i = 1; i < table.rows.length; i++) {
        let row = table.rows[i];
        let cols = row.querySelectorAll('td');

        if (cols.length === 1) continue;

        let rowData = [];
        for (let j = 0; j < cols.length - 1; j++) {
            rowData.push(cols[j].innerText);
        }
        dataToExport.push(rowData);
    }

    let ws = XLSX.utils.aoa_to_sheet(dataToExport);
    let wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Buku Besar");

    let tanggalExport = new Date().toISOString().split('T')[0];
    let fileName = `Laporan_Buku_Besar_${tanggalExport}.xlsx`;

    XLSX.writeFile(wb, fileName);
}