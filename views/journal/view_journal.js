document.addEventListener('DOMContentLoaded', async function () {
    const voucherInput = document.getElementById('add_voucher'); 
    const voucherList = document.getElementById('voucher_list'); 
    const form = document.getElementById('addProductForm');
    window.coaMap = {};

    // 1. Ambil data COA
    try {
        const resCoa = await fetch('/api/table-glmas');
        const coaData = await resCoa.json();
        if (resCoa.ok && Array.isArray(coaData)) {
            coaData.forEach(c => {
                window.coaMap[c.noper] = c.naper;
            });
        }
    } catch (e) {
        console.error('Gagal memuat COA', e);
    }

    // 3. Fungsi helper untuk mencari dan merender data tabel berdasarkan voucher
    async function searchAndRender(targetVoucher) {
        if (!targetVoucher) return;
        try {
            const res = await fetch('/api/table-glmut');
            const allData = await res.json();

            if (res.ok) {
                const filteredData = allData.filter(item => item.no_bill === targetVoucher);
                renderTableData(filteredData);
            } else {
                alert('Gagal mengambil data dari server');
            }
        } catch (err) {
            console.error('Terjadi kesalahan saat mencari data:', err);
        }
    }

    // 4. Cek apakah ada parameter 'voucher' di URL (misal diklik dari halaman lain)
    const urlParams = new URLSearchParams(window.location.search);
    const voucherParam = urlParams.get('voucher');

    if (voucherParam && voucherInput) {
        voucherInput.value = voucherParam;
        await searchAndRender(voucherParam); 
    }

    // 2. Ambil data list voucher untuk <datalist>
    try {
        const response = await fetch('/api/table-glmut');
        const vouchers = await response.json();

        if (response.ok && voucherList && Array.isArray(vouchers)) {
            const uniqueVoucher = [...new Set(vouchers.map(item => item.no_bill))];
            
            voucherList.innerHTML = '';

            uniqueVoucher.forEach(voucherCode => {
                if (voucherCode) {
                    const option = document.createElement('option');
                    option.value = voucherCode;
                    voucherList.appendChild(option);
                }
            });
        }
    } catch (error) {
        console.error('Gagal Memuat Data Voucher', error);
    } 

    

    

    // 5. Event listener saat form disubmit secara manual
    if (form) {
        form.addEventListener('submit', async function (e) {
            e.preventDefault(); 
            const selectedVoucher = voucherInput.value.trim();

            if (!selectedVoucher) {
                alert('Silakan pilih atau ketik voucher terlebih dahulu!');
                return;
            }

            await searchAndRender(selectedVoucher);
        });
    }
});

function renderTableData(rows) {
    let tableBody = document.getElementById('table-body'); 
    if (!tableBody) return;

    tableBody.innerHTML = '';

    let trHead = document.createElement('tr');
    trHead.innerHTML = `
        <th style="padding: 12px; text-align: left;">No</th>
        <th style="padding: 12px; text-align: left;">Tanggal</th>
        <th style="padding: 12px; text-align: left;">COA</th>
        <th style="padding: 12px; text-align: left;">Uraian</th>
        <th style="padding: 12px; text-align: right;">Debet</th>
        <th style="padding: 12px; text-align: right;">Kredit</th>
    `;
    tableBody.appendChild(trHead);

    if (rows.length === 0) {
        let trEmpty = document.createElement('tr');
        trEmpty.innerHTML = `<td colspan="6" style="text-align:center; padding: 15px;">Tidak ada data ditemukan untuk voucher ini</td>`;
        tableBody.appendChild(trEmpty);
        return;
    }

    let totalDebet = 0;
    let totalKredit = 0;

    rows.forEach((item, index) => {
        let tr = document.createElement('tr');
        tr.style.borderBottom = '1px solid #e2e8f0';

        totalDebet += parseFloat(item.debet) || 0;
        totalKredit += parseFloat(item.kredit) || 0;

        let kodeCoa = item.perkiraan || '';
        let namaCoa = window.coaMap && window.coaMap[kodeCoa] ? `${kodeCoa} - ${window.coaMap[kodeCoa]}` : kodeCoa;

        tr.innerHTML = `
            <td style="padding: 12px;">${index + 1}</td>
            <td style="padding: 12px;">${item.tanggal}</td>
            <td style="padding: 12px;">${namaCoa || '-'}</td>
            <td style="padding: 12px;">${item.urai || '-'}</td>
            <td style="padding: 12px; text-align: right;">${(parseFloat(item.debet) || 0).toLocaleString('id-ID')}</td>
            <td style="padding: 12px; text-align: right;">${(parseFloat(item.kredit) || 0).toLocaleString('id-ID')}</td>
        `;
        tableBody.appendChild(tr);
    });

    let trTotal = document.createElement('tr');
    trTotal.innerHTML = `
        <td colspan="4" style="padding: 12px; text-align: right; font-weight: bold;">TOTAL:</td>
        <td style="padding: 12px; text-align: right; font-weight: bold;">${totalDebet.toLocaleString('id-ID')}</td>
        <td style="padding: 12px; text-align: right; font-weight: bold;">${totalKredit.toLocaleString('id-ID')}</td>
    `;
    tableBody.appendChild(trTotal);
}



document.getElementById('logoutBtn').addEventListener('click', function(e) {
    e.preventDefault();
    localStorage.removeItem('user'); 

    window.location.href = '/views/auth/login.html';
});