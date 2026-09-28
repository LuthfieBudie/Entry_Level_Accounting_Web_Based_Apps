document.addEventListener('DOMContentLoaded', async function () {
    const form = document.getElementById('addProductForm');

    if (form) {
        form.addEventListener('submit', async function (e) {
            e.preventDefault();

            const inputDari = document.getElementById('add_tanggal');
            const inputSampai = document.getElementById('add_to_tanggal');

            const dariTanggal = inputDari ? inputDari.value : '';
            const sampaiTanggal = inputSampai ? inputSampai.value : '';

            if (!dariTanggal || !sampaiTanggal) {
                alert('Silakan tentukan rentang tanggal terlebih dahulu!');
                return;
            }

            const url = `/api/table-glmut?dari=${dariTanggal}&sampai=${sampaiTanggal}`;

            try {
                const response = await fetch(url);
                const results = await response.json();

                if (!response.ok) {
                    alert(results.error || 'Gagal memuat data filter');
                    return;
                }

                renderTableData(results, dariTanggal, sampaiTanggal);

            } catch (error) {
                console.error('Detail Error:', error);
                alert('Gagal terhubung ke server atau terjadi kesalahan pada skrip.');
            }
        });
    }
});

function renderTableData(rows, dariTanggal, sampaiTanggal) {
    let tableBody = document.getElementById('table-body'); 
    if (!tableBody) return;

    tableBody.innerHTML = '';

    // 1. Baris Informasi Periode Tanggal (Total 9 Kolom)
    let trInfo = document.createElement('tr');
    trInfo.className = 'print-header-info';
    trInfo.innerHTML = `
        <th colspan="9" style="padding: 12px; font-weight: bold; font-size: 14px; color: #000; text-align: left;">
            <div style="display: flex; margin-bottom: 2px;">
                <span style="width: 130px; white-space: nowrap;">Periode Tanggal</span>
                <span style="margin-right: 8px;">:</span>
                <span>${dariTanggal || '-'} s/d ${sampaiTanggal || '-'}</span>
            </div>
        </th>
    `;
    tableBody.appendChild(trInfo);

    
    let trHead = document.createElement('tr');
    trHead.innerHTML = `
        <th style="padding: 12px; text-align: left;">No</th>
        <th style="padding: 12px; text-align: left;">Bukti</th>
        <th style="padding: 12px; text-align: left;">Tanggal</th>
        <th style="padding: 12px; text-align: left;">Uraian</th>
        <th style="padding: 12px; text-align: left;">Perkiraan</th>
        <th style="padding: 12px; text-align: left;">Nama Perkiraan</th>
        <th style="padding: 12px; text-align: right;">Debet</th>
        <th style="padding: 12px; text-align: right;">Kredit</th>
        <th style="padding: 12px; text-align: right;">Aksi</th>
    `;
    tableBody.appendChild(trHead);

    
    if (!rows || rows.length === 0) {
        let trEmpty = document.createElement('tr');
        trEmpty.innerHTML = `<td colspan="9" style="text-align:center; padding: 15px;">Data tidak ditemukan</td>`;
        tableBody.appendChild(trEmpty);
        return;
    }

    rows.sort((a, b) => new Date(a.tanggal) - new Date(b.tanggal));

    let totaldebet = 0;
    let totalkredit = 0;

    
    rows.forEach((item, index) => {
        let tr = document.createElement('tr');
        tr.style.borderBottom = '1px solid #e2e8f0';

        let debetVal = parseFloat(item.debet) || 0;
        let kreditVal = parseFloat(item.kredit) || 0;

        totaldebet += debetVal;
        totalkredit += kreditVal;

        tr.innerHTML = `
            <td style="padding: 12px;">${index + 1}</td>
            <td style="padding: 12px;">${item.no_bill || '-'}</td>
            <td style="padding: 12px;">${item.tanggal || '-'}</td>
            <td style="padding: 12px;">${item.urai || '-'}</td>
            <td style="padding: 12px;">${item.perkiraan || '-'}</td>
            <td style="padding: 12px;">${item.nama_perkiraan || '-'}</td>
            <td style="padding: 12px; text-align: right;">${debetVal.toLocaleString('id-ID')}</td>
            <td style="padding: 12px; text-align: right;">${kreditVal.toLocaleString('id-ID')}</td>
            <td style="padding: 12px; text-align: right;">
                <button onclick="window.location.href = '/views/journal/view_journal.html?voucher=${encodeURIComponent(item.no_bill)}'" style="background: #16a720; color: white; border: none; padding: 6px 10px; border-radius: 4px; cursor: pointer;">Detail</button>
            </td>
        `;
        tableBody.appendChild(tr);
    });


    let trtotal = document.createElement('tr');
    trtotal.innerHTML = `
        <td colspan="6" style="padding: 12px; text-align: right; font-weight: bold;">TOTAL:</td>
        <td style="padding: 12px; text-align: right; font-weight: bold;">${totaldebet.toLocaleString('id-ID')}</td>
        <td style="padding: 12px; text-align: right; font-weight: bold;">${totalkredit.toLocaleString('id-ID')}</td>
        
    `;
    tableBody.appendChild(trtotal);
}













document.getElementById('logoutBtn').addEventListener('click', function(e) {
    e.preventDefault();
    localStorage.removeItem('user'); 

    window.location.href = '/views/auth/login.html';
});