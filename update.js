async function loadDashboardData() {
    try {
        let response = await fetch('/api/total-sales');
        let data = await response.json();
        
        let total = data.grand_total ? data.grand_total : 0;
        document.getElementById('total-revenue-value').innerText =  Number(total).toLocaleString('id-ID');

        let resQty = await fetch('/api/total-quantity');
        let dataQty = await resQty.json();
        let qty = dataQty.total_qty ? dataQty.total_qty : 0;
        document.getElementById('total-quantity-value').innerText = Number(qty).toLocaleString('id-ID') + " Pcs";

        let resCountTransaction = await fetch ('/api/total-transaction');
        let dataCountTransaction = await resCountTransaction.json();
        let CountTransaction = dataCountTransaction.total_customer ? dataCountTransaction.total_customer : 0;
        document.getElementById('total-count-transaction').innerText = Number(CountTransaction).toLocaleString('id-ID') ;

        let resAVGOrder = await fetch ('/api/average-order');
        let dataAVGOrder = await resAVGOrder.json();
        let AVGOrder = dataAVGOrder.average_total ? dataAVGOrder.average_total : 0;
        document.getElementById('total-average-order').innerText = Number(AVGOrder).toLocaleString('id-ID') ;

        

    } catch (error) {
        console.error('Gagal memuat data:', error);
    }
    
}


async function fetchData(url, elementId, formatFn) {
    try {
        let response = await fetch(url);
        if (!response.ok) throw new Error('Gagal dari server');
        let data = await response.json();
        
        // Ambil nilai pertama dari objek JSON secara dinamis
        let value = Object.values(data)[0] ? Object.values(data)[0] : 0;
        
        // Format dan tampilkan ke elemen HTML
        document.getElementById(elementId).innerText = formatFn(value);
    } catch (error) {
        console.error(`Error pada ${url}:`, error);
        document.getElementById(elementId).innerText = 'Gagal memuat';
    }
}
        
        


async function loadRevenueChart() {
    try {
        let resRevenuePerDays = await fetch ('/api/total-revenue-per-days');
        let dataRevenuePerDays = await resRevenuePerDays.json();

        // 1. Pisahkan data untuk Sumbu X (Tanggal) dan Sumbu Y (Nilai Revenue)
        let labels = dataRevenuePerDays.map(item => item.Date); // Mengambil tanggal
        let dataValues = dataRevenuePerDays.map(item => item.daily_revenue); // Mengambil total revenue

        // 2. Ambil elemen canvas di HTML
        let ctx = document.getElementById('revenue-per-days').getContext('2d');

        new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Total Revenue (Rp)',
                    data: dataValues,
                    borderColor: '#4f46e5',
                    backgroundColor: 'rgba(79, 70, 229, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.3,
                    pointRadius: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: {
                        ticks: {
                            maxTicksLimit: 12, // Membatasi jumlah tanggal yang tampil di bawah agar tidak sesak
                            autoSkip: true
                        }
                    },
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });

    } catch (error) {
        console.error('Gagal memuat data chart revenue:', error);
    }
}



// 3. Jalankan kedua fungsi saat halaman dimuat
loadDashboardData();
loadRevenueChart();