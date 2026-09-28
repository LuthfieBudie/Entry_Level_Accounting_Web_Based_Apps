let globalGroups = [];

document.addEventListener('DOMContentLoaded', async function () {
    const groupSelect = document.getElementById('add_coa');
    const form = document.getElementById('addProductForm');

    const inputDari = document.getElementById('add_tanggal');
    const inputSampai = document.getElementById('add_to_tanggal');

    try {
        const groupResponse = await fetch('/api/table-glmas');
        globalGroups = await groupResponse.json(); 

        if (groupResponse.ok && groupSelect) {
            globalGroups.forEach(item => {
                const option = document.createElement('option');
                option.value = item.noper;
                option.textContent = `${item.noper} - ${item.naper}`; 
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

            let url = `/api/glmut?dari_tanggal=${dariTanggal}&sampai_tanggal=${sampaiTanggal}`;
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

                renderTableData(results.data, results.saldoAwal, dariTanggal, sampaiTanggal, globalGroups, selectedCoa);

            } catch (error) {
                console.error('Error:', error);
                alert('Gagal terhubung ke server.');
            }
        });
    }
});

function renderTableData(rows, saldoAwalServer, dariTanggal, sampaiTanggal, globalGroups, selectedCoa) {
    let tableBody = document.getElementById('table-body'); 
    if (!tableBody) return;

    tableBody.innerHTML = '';

    let coaText = 'Semua COA';
    if (selectedCoa) {
        let foundCoa = globalGroups ? globalGroups.find(g => String(g.noper) === String(selectedCoa)) : null;
        coaText = foundCoa ? `${foundCoa.noper} - ${foundCoa.naper}` : selectedCoa;
    }

    // 1. Baris Informasi Periode & COA (colspan diubah jadi 10 karena ada penambahan kolom Saldo)
    let trInfo = document.createElement('tr');
    trInfo.className = 'print-header-info';
    trInfo.innerHTML = `
        <th colspan="10" style="padding: 12px; font-weight: bold; font-size: 14px; color: #000; text-align: left;">
            <div style="display: flex; margin-bottom: 2px;">
                <span style="width: 130px; white-space: nowrap;">Periode Tanggal</span>
                <span style="margin-right: 8px;">:</span>
                <span>${dariTanggal || '-'} s/d ${sampaiTanggal || '-'}</span>
            </div>
            <div style="display: flex;">
                <span style="width: 130px; white-space: nowrap;">COA</span>
                <span style="margin-right: 8px;">:</span>
                <span>${coaText}</span>
            </div>
        </th>
    `;
    tableBody.appendChild(trInfo);

    // 2. Baris Header Tabel (Ditambahkan kolom Saldo)
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
        <th style="padding: 12px; text-align: right;">Saldo</th>
    `;
    tableBody.appendChild(trHead);

    if (!rows || rows.length === 0) {
        let trEmpty = document.createElement('tr');
        trEmpty.innerHTML = `<td colspan="10" style="text-align:center; padding: 15px;">Tidak ada data ditemukan</td>`;
        tableBody.appendChild(trEmpty);
        return;
    }

    let totaldebet = 0;
    let totalkredit = 0;
    let currentSaldo = saldoAwalServer;

    // 3. Perulangan Isi Data & Akumulasi Saldo Berjalan Kronologis
    rows.forEach((item, index) => {
        let tr = document.createElement('tr');
        tr.style.borderBottom = '1px solid #e2e8f0';

        let debetVal = parseFloat(item.debet) || 0;
        let kreditVal = parseFloat(item.kredit) || 0;

        totaldebet += debetVal;
        totalkredit += kreditVal;

        // Rumus Saldo Berjalan: Saldo Sebelumnya + Debet - Kredit
        currentSaldo = currentSaldo + debetVal - kreditVal;

        tr.innerHTML = `
            <td style="padding: 12px;">${index + 1}</td>
            <td style="padding: 12px;">${item.bukti || '-'}</td>
            <td style="padding: 12px;">${item.tanggal || '-'}</td>
            <td style="padding: 12px;">${item.urai || '-'}</td>
            <td style="padding: 12px;">${item.perkiraan || '-'}</td>
            <td style="padding: 12px;">${item.nama_perkiraan || '-'}</td>
            <td style="padding: 12px; text-align: right;">${debetVal.toLocaleString('id-ID')}</td>
            <td style="padding: 12px; text-align: right;">${kreditVal.toLocaleString('id-ID')}</td>
            <td style="padding: 12px; text-align: right; font-weight: bold;">${currentSaldo.toLocaleString('id-ID')}</td>
        `;
        tableBody.appendChild(tr);
    });

    // 4. Baris Total
    let trtotal = document.createElement('tr');
    trtotal.innerHTML = `
        <td colspan="6" style="padding: 12px; text-align: right; font-weight: bold;">TOTAL:</td>
        <td style="padding: 12px; text-align: right; font-weight: bold;">${totaldebet.toLocaleString('id-ID')}</td>
        <td style="padding: 12px; text-align: right; font-weight: bold;">${totalkredit.toLocaleString('id-ID')}</td>
        <td colspan="2"></td>
    `;
    tableBody.appendChild(trtotal);

    // 5. Baris Saldo Awal
    let trSaldoAwal = document.createElement('tr');
    trSaldoAwal.innerHTML = `
        <td colspan="6" style="padding: 12px; text-align: right; font-weight: bold;">SALDO AWAL:</td>
        <td style="padding: 12px; text-align: right; font-weight: bold;">${saldoAwalServer.toLocaleString('id-ID')}</td>
        <td colspan="3"></td>
    `;
    tableBody.appendChild(trSaldoAwal);

    // 6. Baris Saldo Akhir
    let trSaldoAkhir = document.createElement('tr');
    trSaldoAkhir.innerHTML = `
        <td colspan="6" style="padding: 12px; text-align: right; font-weight: bold;">SALDO AKHIR:</td>
        <td style="padding: 12px; text-align: right; font-weight: bold;">${currentSaldo.toLocaleString('id-ID')}</td>
        <td colspan="3"></td>
    `;
    tableBody.appendChild(trSaldoAkhir);
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

    // Bagian mengambil baris informasi header (Periode & COA)
    for (let i = 0; i < table.rows.length; i++) {
        let row = table.rows[i];
        let text = row.innerText.trim();
        
        if (text.includes(':') && row.querySelectorAll('td').length <= 2) {
            let lines = row.querySelectorAll('div');
            
            if (lines.length > 0) {
                lines.forEach(line => {
                    let parts = line.innerText.split(':');
                    if (parts.length >= 2) {
                        let label = parts[0].trim();
                        let value = parts.slice(1).join(':').trim();
                        dataToExport.push([label, ":", value]);
                    }
                });
            } else {
                let parts = text.split('\n');
                parts.forEach(part => {
                    let subParts = part.split(':');
                    if (subParts.length >= 2) {
                        let label = subParts[0].trim();
                        let value = subParts.slice(1).join(':').trim();
                        dataToExport.push([label, ":", value]);
                    }
                });
            }
        } else if (row.querySelectorAll('td').length > 1 || i === 0) {
            if (dataToExport.length > 0 && dataToExport[dataToExport.length - 1].length > 0) {
                dataToExport.push([]);
            }
            break;
        }
    }

    // Header tabel Excel (disertakan Saldo)
    let headers = ['No', 'Nomor Bill', 'Tanggal', 'Uraian', 'Perkiraan', 'Nama Perkiraan', 'Debet', 'Kredit', 'Saldo'];
    dataToExport.push(headers); 

    let totalDebet = 0;
    let totalKredit = 0;
    let headerRowIndex = dataToExport.length - 1;
    let runningSaldoForExcel = 0;

    // Ambil saldo awal dari server via variabel global/render jika dibutuhkan, atau hitung ulang
    let selectedCoa = document.getElementById('add_coa')?.value;
    let foundCoa = globalGroups ? globalGroups.find(g => String(g.noper) === String(selectedCoa)) : null;
    let saldoDebetAwal = foundCoa ? (parseFloat(foundCoa.awald) || 0) - (parseFloat(foundCoa.awalk) || 0) : 0;
    runningSaldoForExcel = saldoDebetAwal;

    for (let i = 0; i < table.rows.length; i++) {
        let row = table.rows[i];
        let cols = row.querySelectorAll('td');

        if (cols.length <= 1) continue;

        let rowText = row.innerText.trim().toUpperCase();
        
        if (rowText.includes('TOTAL') || rowText.includes('SALDO AWAL') || rowText.includes('SALDO AKHIR')) {
            continue;
        }

        let noUrutVal = cols[0]?.innerText.trim() || '';
        let voucherVal = cols[1]?.innerText.trim() || '';
        let tanggalVal = cols[2]?.innerText.trim() || '';
        let uraianVal = cols[3]?.innerText.trim() || '';
        let perkiraanVal = cols[4]?.innerText.trim() || '';
        let namaPerkiraanVal = cols[5]?.innerText.trim() || '';

        let debetVal = parseFloat(cols[6]?.innerText.replace(/\./g, '').replace(/,/g, '.')) || 0;
        let kreditVal = parseFloat(cols[7]?.innerText.replace(/\./g, '').replace(/,/g, '.')) || 0;

        totalDebet += debetVal;
        totalKredit += kreditVal;
        runningSaldoForExcel = runningSaldoForExcel + debetVal - kreditVal;

        let rowData = [noUrutVal, voucherVal, tanggalVal, uraianVal, perkiraanVal, namaPerkiraanVal, debetVal, kreditVal, runningSaldoForExcel];
        dataToExport.push(rowData);
    }

    let saldoAkhir = saldoDebetAwal + totalDebet - totalKredit;

    let totalRow = ['', '', '', '', 'TOTAL:', '', totalDebet, totalKredit, ''];
    dataToExport.push(totalRow);

    let saldoAwalRow = ['', '', '', '', 'SALDO AWAL:', '', saldoDebetAwal, '', ''];
    dataToExport.push(saldoAwalRow);

    let saldoAkhirRow = ['', '', '', '', 'SALDO AKHIR:', '', saldoAkhir, '', ''];
    dataToExport.push(saldoAkhirRow);

    let ws = XLSX.utils.aoa_to_sheet(dataToExport);
    let range = XLSX.utils.decode_range(ws['!ref']);

    for (let R = range.s.r; R <= range.e.r; ++R) {
        for (let C = range.s.c; C <= range.e.c; ++C) {
            let cellRef = XLSX.utils.encode_cell({r: R, c: C});
            if (!ws[cellRef]) continue;
            if (!ws[cellRef].s) ws[cellRef].s = {};
            
            ws[cellRef].s.font = { sz: 10, name: "Calibri" };

            if (C === 1 && ws[cellRef].v === ":" && R < headerRowIndex) {
                ws[cellRef].s.alignment = { horizontal: "center", vertical: "center" };
            }
            else if (R === headerRowIndex) {
                ws[cellRef].s.font.bold = true;
                ws[cellRef].s.alignment = { horizontal: "center", vertical: "center" };
            }
            // Format angka rata kanan untuk kolom Debet (6), Kredit (7), dan Saldo (8)
            else if (R > headerRowIndex && R < range.e.r - 2 && (C === 6 || C === 7 || C === 8)) {
                ws[cellRef].s.alignment = { horizontal: "right", vertical: "center" };
                ws[cellRef].z = '#,##0';
            }
            else if (R >= range.e.r - 2 && (C === 6 || C === 7)) {
                ws[cellRef].s.font.bold = true;
                ws[cellRef].s.alignment = { horizontal: "right", vertical: "center" };
                ws[cellRef].z = '#,##0';
            }
        }
    }

    let colWidths = [];
    for (let C = range.s.c; C <= range.e.c; ++C) {
        let maxWidth = 10; 
        for (let R = range.s.r; R <= range.e.r; ++R) {
            let cellRef = XLSX.utils.encode_cell({r: R, c: C});
            if (ws[cellRef] && ws[cellRef].v) {
                let cellLength = ws[cellRef].v.toString().length;
                if (cellLength > maxWidth) {
                    maxWidth = cellLength;
                }
            }
        }
        colWidths.push({ wch: maxWidth + 3 });
    }
    ws['!cols'] = colWidths;

    let wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Buku Besar");

    let tanggalExport = new Date().toISOString().split('T')[0];
    let fileName = `Buku_Besar_Export_${tanggalExport}.xlsx`;

    XLSX.writeFile(wb, fileName);
}




document.getElementById('logoutBtn').addEventListener('click', function(e) {
    e.preventDefault();
    localStorage.removeItem('user'); 

    window.location.href = '/views/auth/login.html';
});