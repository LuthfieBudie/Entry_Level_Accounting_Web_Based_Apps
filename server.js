const { error } = require('console');
const express = require('express');
const mysql = require('mysql2');
const path = require('path');

const app = express();
const PORT = 3000;

// === KONEKSI DATABASE ===
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'koperasi',

});

db.connect((err) => {
    if (err) {
        console.error('Gagal terhubung ke database:', err);
    } else {
        console.log('Berhasil terhubung ke database MySQL!');
    }
});

app.use(express.static(path.join(__dirname)));
app.use(express.json());

// === ENDPOINT: TABLE GROUP ===
app.get('/api/table-klmpk', (req, res) => {
    const query = 'SELECT * FROM `klmpk`';
    db.query(query, (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Gagal mengambil data' });
        }
        res.json(results);
    });
});

app.post('/api/table-klmpk', (req, res) => {
    const { kode, nama, level } = req.body;

    if (!kode || !nama) {
        return res.status(400).json({ error: 'Code dan Name wajib diisi' });
    }

    const query = 'INSERT INTO `klmpk` (kode, nama, `level`) VALUES (?, ?, ?)';
    db.query(query, [kode, nama, level], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Gagal menyimpan data' });
        }
        res.json({ message: 'Data berhasil disimpan', insertId: result.insertId });
    });
});

// === ENDPOINT: TABLE CHART OF ACCOUNTS (COA) ===

// Ambil semua data COA
app.get('/api/table-glmas', (req, res) => {
    const query = `
        SELECT 
            coa.noper,
            coa.naper,
            coa.klmpk,
            coa.awald,
            coa.awalk,
            coa.level,
            coa.grup
        FROM glmas coa
    `;
    
    db.query(query, (err, results) => {
        if (err) {
            console.error('Error SQL:', err); // Ini akan mencetak error asli ke terminal
            return res.status(500).json({ error: err.message });
        }
        res.json(results);
    });
});

app.get('/api/table-glmas', (req, res) => {
    const query = `SELECT noper, naper FROM glmas`;
    db.query(query, (err, results) => {
        if (err) {
            console.error('Error SQL glmas:', err);
            return res.status(500).json({ error: err.message });
        }
        res.json(results);
    });
});

app.get('/api/table-glmas/:noper', (req, res) => {
    const { noper } = req.params;
    db.query('SELECT noper, naper, awald, awalk FROM glmas WHERE TRIM(noper) = TRIM(?)', [noper], (err, results) => {
        if (err || results.length === 0) {
            return res.status(404).json({ error: 'Data tidak ditemukan' });
        }
        res.json(results[0]);
    });
});

// Simpan data baru COA
app.post('/api/table-glmas', (req, res) => {
    const { noper, naper, klmpk, awald, awalk, level, grup } = req.body;
    if (!noper || !naper) return res.status(400).json({ error: 'Code dan Name wajib diisi' });

    const query = `INSERT INTO glmas (noper, naper, klmpk, awald, awalk, level, \`grup\`) VALUES (?, ?, ?, ?, ?, ?, ?)`;
    db.query(query, [noper, naper, klmpk, awald || 0, awalk || 0, level || null, grup], (err, result) => {
        if (err) return res.status(500).json({ error: 'Gagal menyimpan data' });
        res.json({ message: 'Data berhasil disimpan' }); 
    });
});

// Update data COA
app.put('/api/table-glmas/:noper', (req, res) => {
    const { noper } = req.params;
    const { naper, klmpk, awald, awalk, level, grup } = req.body;

    const query = `
        UPDATE glmas 
        SET naper = ?, klmpk = ?, awald = ?, awalk = ?, level = ?, \`grup\` = ? 
        WHERE TRIM(noper) = TRIM(?)
    `;
    db.query(query, [naper, klmpk, awald || 0, awalk || 0, level || null, grup, noper], (err, result) => {
        if (err) {
            console.error('Error SQL:', err);
            return res.status(500).json({ error: 'Gagal memperbarui data' });
        }
        res.json({ message: 'Data berhasil diperbarui' });
    });
});

// Hapus data COA
app.delete('/api/table-glmas/:noper', (req, res) => {
    const { noper } = req.params;
    db.query('DELETE FROM glmas WHERE TRIM(noper) = TRIM(?)', [noper], (err, result) => {
        if (err) {
            console.error('Error SQL:', err);
            return res.status(500).json({ error: 'Gagal menghapus data' });
        }
        res.json({ message: 'Data berhasil dihapus' });
    });
});

app.get('/api/coa', (req, res) => {
    const query = 'SELECT noper, naper FROM glmas ORDER BY noper ASC';
    db.query(query, (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(results);
    });
});













































app.get('/api/table-gltemp_k', (req, res) => {
    const jenisPrefix = req.query.jenis || 'KK'; 
    const query = `
        SELECT 
            id, 
            bukti, 
            DATE_FORMAT(tanggal, '%Y-%m-%d') AS tanggal, 
            perkiraan, 
            jenis, 
            dk, 
            urai, 
            debet, 
            kredit, 
            user_name, 
            logtime 
        FROM gltemp_k
        WHERE bukti LIKE ?
    `;
    
    db.query(query, [`${jenisPrefix}-%`], (err, results) => {
        if (err) {
            console.error('Error SQL gltemp_k:', err);
            return res.status(500).json({ error: err.message });
        }
        res.json(results);
    });
});

app.post('/api/table-gltemp_k', (req, res) => {
    const { tanggal, perkiraan, dk, urai, nilai, user_name, jenis_prefix } = req.body;
    const prefix = jenis_prefix === 'KM' ? 'KM' : 'KK';

    if (!tanggal || !perkiraan || !dk || !nilai) {
        return res.status(400).json({ error: 'Tanggal, Perkiraan, DK, dan Nilai wajib diisi' });
    }

    const numericNilai = parseFloat(nilai) || 0;
    const debet = dk === 'D' ? numericNilai : 0;
    const kredit = dk === 'K' ? numericNilai : 0;

    const dateObj = new Date(tanggal);
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const yearMonth = `${year}${month}`; 

    const searchPattern = `${prefix}-${yearMonth}%`;

    const getLastBuktiQuery = `
        SELECT bukti FROM (
            SELECT bukti FROM gltemp_k WHERE bukti LIKE ?
            UNION
            SELECT bukti FROM glmut WHERE bukti LIKE ?
        ) AS combined_bukti 
        ORDER BY bukti DESC 
        LIMIT 1
    `;

    db.query(getLastBuktiQuery, [searchPattern, searchPattern], (err, results) => {
        if (err) {
            console.error('Error saat generate nomor bukti:', err);
            return res.status(500).json({ error: 'Gagal membuat nomor bukti otomatis' });
        }

        let newSequence = 1;

        if (results.length > 0) {
            const lastBukti = results[0].bukti; 
            const lastSeqStr = lastBukti.slice(-4); 
            const lastSeqNum = parseInt(lastSeqStr, 10);
            
            if (!isNaN(lastSeqNum)) {
                newSequence = lastSeqNum + 1;
            }
        }

        const formattedSeq = String(newSequence).padStart(4, '0');
        
        const currentBukti = `${prefix}-${yearMonth}${formattedSeq}`;

        const insertQuery = `
            INSERT INTO gltemp_k (bukti, tanggal, perkiraan, dk, urai, debet, kredit, user_name, logtime) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())
        `;

        db.query(insertQuery, [currentBukti, tanggal, perkiraan, dk, urai, debet, kredit, user_name], (err, result) => {
            if (err) {
                console.error('Error SQL Insert gltemp_k:', err);
                return res.status(500).json({ error: 'Gagal menyimpan data ke database' });
            }
            res.json({ 
                message: 'Data berhasil disimpan', 
                insertId: result.insertId, 
                bukti: currentBukti 
            });
        });
    });
});

app.get('/api/table-gltemp_k/:id', (req, res) => {
    const { id } = req.params;
    const query = 'SELECT id, bukti, DATE_FORMAT(tanggal, "%Y-%m-%d") AS tanggal, perkiraan, dk, urai, debet, kredit, user_name FROM gltemp_k WHERE id = ?';
    
    db.query(query, [id], (err, results) => {
        if (err || results.length === 0) {
            return res.status(404).json({ error: 'Data tidak ditemukan' });
        }
        res.json(results[0]);
    });
});


app.put('/api/table-gltemp_k/:id', (req, res) => {
    const { id } = req.params;
    const { tanggal, perkiraan, dk, urai, nilai, user_name } = req.body;

    if (!tanggal || !perkiraan || !dk || !nilai) {
        return res.status(400).json({ error: 'Tanggal, Perkiraan, DK, dan Nilai wajib diisi' });
    }

    const numericNilai = parseFloat(nilai) || 0;
    const debet = dk === 'D' ? numericNilai : 0;
    const kredit = dk === 'K' ? numericNilai : 0;

    const query = `
        UPDATE gltemp_k 
        SET tanggal = ?, perkiraan = ?, dk = ?, urai = ?, debet = ?, kredit = ?, user_name = ?
        WHERE id = ?
    `;

    db.query(query, [tanggal, perkiraan, dk, urai, debet, kredit, user_name, id], (err, result) => {
        if (err) {
            console.error('Error SQL Update gltemp_k:', err);
            return res.status(500).json({ error: 'Gagal memperbarui data' });
        }
        res.json({ message: 'Data berhasil diperbarui' });
    });
});


app.delete('/api/table-gltemp_k/:id', (req, res) => {
    const { id } = req.params;
    const query = 'DELETE FROM gltemp_k WHERE id = ?';

    db.query(query, [id], (err, result) => {
        if (err) {
            console.error('Error SQL Delete gltemp_k:', err);
            return res.status(500).json({ error: 'Gagal menghapus data dari database' });
        }
        res.json({ message: 'Data berhasil dihapus' });
    });
});





























app.post('/api/posting', (req, res) => {
    const { jenis_prefix } = req.body;
    const prefix = jenis_prefix === 'KM' ? 'KM-' : 'KK-';

    const checkBalanceQuery = `
        SELECT SUM(debet) AS total_debet, SUM(kredit) AS total_kredit 
        FROM gltemp_k 
        WHERE bukti LIKE ?
    `;

    db.query(checkBalanceQuery, [`${prefix}%`], (err, balanceResults) => {
        if (err) {
            console.error('Error saat cek balance:', err);
            return res.status(500).json({ error: 'Gagal mengecek status balance data' });
        }

        const totalDebet = parseFloat(balanceResults[0].total_debet) || 0;
        const totalKredit = parseFloat(balanceResults[0].total_kredit) || 0;

        if (totalDebet !== totalKredit) {
            return res.status(400).json({ 
                error: `Posting gagal! Total Debet (${totalDebet}) dan Total Kredit (${totalKredit}) belum balance.` 
            });
        }

        const getVoucherQuery = `SELECT bukti FROM gltemp_k WHERE bukti LIKE ? LIMIT 1`;
        
        db.query(getVoucherQuery, [`${prefix}%`], (err, voucherResult) => {
            if (err || voucherResult.length === 0) {
                return res.status(500).json({ error: 'Gagal mengambil nomor bukti transaksi.' });
            }

            const currentVoucher = voucherResult[0].bukti; 

            const insertQuery = `
                INSERT INTO glmut (bukti, tanggal, urai, perkiraan, debet, kredit, total)
                SELECT 
                    bukti, 
                    tanggal, 
                    urai, 
                    perkiraan, 
                    debet, 
                    kredit, 
                    (debet + kredit) AS total
                FROM gltemp_k
                WHERE bukti LIKE ?
            `;

            db.query(insertQuery, [`${prefix}%`], (err, result) => {
                if (err) {
                    console.error('Error saat proses posting ke glmut:', err);
                    return res.status(500).json({ error: 'Gagal melakukan proses posting data' });
                }

                const clearTempQuery = `DELETE FROM gltemp_k WHERE bukti LIKE ?`;
                db.query(clearTempQuery, [`${prefix}%`], (clearErr) => {
                    if (clearErr) {
                        console.error('Error saat membersihkan gltemp_k:', clearErr);
                        return res.status(500).json({ error: 'Data ter-posting, tetapi gagal mengosongkan tabel sementara' });
                    }

                    res.json({ 
                        message: `Posting berhasil! Nomor Voucher: ${currentVoucher}`, 
                        voucher: currentVoucher,
                        affectedRows: result.affectedRows 
                    });
                });
            });
        });
    });
});






















































app.delete('/api/table-klmpk/:kode', (req, res) => {
    const { kode } = req.params;
    const query = 'DELETE FROM `klmpk` WHERE kode = ?';

    db.query(query, [kode], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Gagal menghapus data dari database' });
        }
        res.json({ message: 'Data berhasil dihapus' });
    });
});

app.get('/api/table-klmpk/:kode', (req, res) => {
    const { kode } = req.params;
    db.query('SELECT * FROM `klmpk` WHERE kode = ?', [kode], (err, results) => {
        if (err || results.length === 0) {
            return res.status(404).json({ error: 'Data tidak ditemukan' });
        }
        res.json(results[0]);
    });
});

app.put('/api/table-klmpk/:kode', (req, res) => {
    const { kode } = req.params;
    const { nama, level } = req.body;

    const query = 'UPDATE `klmpk` SET nama = ?, `level` = ? WHERE kode = ?';
    db.query(query, [nama, level, kode], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Gagal memperbarui data' });
        }
        res.json({ message: 'Data berhasil diperbarui' });
    });
});

































const crypto = require('crypto');
app.post('/api/user', (req, res) => {
    const { user_nama, user_password } = req.body;

    if (!user_nama || !user_password) {
        return res.status(400).json({ error: 'Username dan password wajib diisi' });
    }

    const hashedPassword = crypto.createHash('md5').update(user_password).digest('hex');
    const query = 'SELECT * FROM user WHERE user_nama = ? AND user_password = ?';
    
    db.query(query, [user_nama, hashedPassword], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Terjadi kesalahan pada database' });
        }

        if (results.length === 0) {
            return res.status(401).json({ error: 'Username atau password salah!' });
        }

        res.json({ message: 'Login berhasil', user: results[0] });
    });
});

app.get('/api/current-user', (req, res) => {
    if (req.session && req.session.user) {
        res.json({ user_nama: req.session.user.user_nama });
    } else {
        res.json({ user_nama: 'admin' }); 
    }
});



































// 1. Ambil data glmut dengan filter rentang tanggal (GET)
app.get('/api/table-glmut', (req, res) => {
    const { dari, sampai, voucher } = req.query;

    let query = `
        SELECT 
            m.id, 
            m.no_bill AS voucher, 
            m.no_bill, 
            DATE_FORMAT(m.tanggal, '%Y-%m-%d') AS tanggal, 
            m.urai, 
            m.perkiraan, 
            COALESCE(g.naper, '-') AS nama_perkiraan, 
            m.debet, 
            m.kredit, 
            m.total 
        FROM glmut m
        LEFT JOIN glmas g ON TRIM(m.perkiraan) = TRIM(g.noper)
    `;

    let queryParams = [];
    let conditions = [];

    if (dari && sampai) {
        conditions.push(`m.tanggal BETWEEN ? AND ?`);
        queryParams.push(dari, sampai);
    }

    if (voucher) {
        conditions.push(`m.no_bill = ?`);
        queryParams.push(voucher);
    }

    if (conditions.length > 0) {
        query += ` WHERE ` + conditions.join(' AND ');
    }

    db.query(query, queryParams, (err, results) => {
        if (err) {
            console.error('Error SQL:', err);
            return res.status(500).json({ error: 'Gagal mengambil data' });
        }
        res.json(results);
    });
});



app.get(['/api/glmut', '/api/table-glmut'], (req, res) => {
    const dari = req.query.dari || req.query.dari_tanggal;
    const sampai = req.query.sampai || req.query.sampai_tanggal;
    const coa = req.query.coa;

    if (!coa) {
        return res.status(400).json({ error: 'COA harus dipilih untuk menampilkan Buku Besar.' });
    }

    const getCoaQuery = `SELECT awald, awalk FROM glmas WHERE TRIM(noper) = TRIM(?)`;
    
    db.query(getCoaQuery, [coa], (err, coaResults) => {
        if (err) {
            console.error('Error SQL COA:', err);
            return res.status(500).json({ error: 'Gagal mengambil data master COA' });
        }

        let baseSaldoAwal = 0;
        if (coaResults.length > 0) {
            let awalDebet = parseFloat(coaResults[0].awald) || 0;
            let awalKredit = parseFloat(coaResults[0].awalk) || 0;
            baseSaldoAwal = awalDebet - awalKredit;
        }

        let getMutationBeforeQuery = `
            SELECT 
                COALESCE(SUM(debet), 0) as total_debet, 
                COALESCE(SUM(kredit), 0) as total_kredit 
            FROM glmut 
            WHERE TRIM(perkiraan) = TRIM(?)
        `;
        let mutationParams = [coa];

        if (dari) {
            getMutationBeforeQuery += ` AND tanggal < ?`;
            mutationParams.push(dari);
        }

        db.query(getMutationBeforeQuery, mutationParams, (err, mutBeforeResults) => {
            if (err) {
                console.error('Error SQL Mutasi Sebelum:', err);
                return res.status(500).json({ error: 'Gagal menghitung mutasi lalu' });
            }

            let mutasiSebelumDebet = parseFloat(mutBeforeResults[0].total_debet) || 0;
            let mutasiSebelumKredit = parseFloat(mutBeforeResults[0].total_kredit) || 0;
            
            let saldoAwalPeriode = baseSaldoAwal + (mutasiSebelumDebet - mutasiSebelumKredit);

            let query = `
                SELECT 
                    m.id, 
                    m.bukti, 
                    DATE_FORMAT(m.tanggal, '%Y-%m-%d') AS tanggal, 
                    m.urai, 
                    m.perkiraan, 
                    COALESCE(g.naper, '-') AS nama_perkiraan, 
                    m.debet, 
                    m.kredit, 
                    m.total 
                FROM glmut m
                LEFT JOIN glmas g ON TRIM(m.perkiraan) = TRIM(g.noper)
                WHERE TRIM(m.perkiraan) = TRIM(?)
            `;
            let queryParams = [coa];

            if (dari && sampai) {
                query += ` AND m.tanggal BETWEEN ? AND ?`;
                queryParams.push(dari, sampai);
            }

            query += ` ORDER BY m.tanggal ASC, m.id ASC`;

            db.query(query, queryParams, (err, results) => {
                if (err) {
                    console.error('Error SQL Transaksi:', err);
                    return res.status(500).json({ error: 'Gagal mengambil data transaksi' });
                }

                let currentSaldo = saldoAwalPeriode;
                let dataWithBalance = results.map(row => {
                    let debet = parseFloat(row.debet) || 0;
                    let kredit = parseFloat(row.kredit) || 0;
                    currentSaldo = currentSaldo + debet - kredit;

                    return {
                        ...row,
                        saldo: currentSaldo 
                    };
                });
                let saldoAkhir = dataWithBalance.length > 0 ? dataWithBalance[dataWithBalance.length - 1].saldo : saldoAwalPeriode;

                res.json({
                    saldoAwal: saldoAwalPeriode,
                    saldoAkhir: saldoAkhir,
                    data: dataWithBalance
                });
            });
        });
    });
});




// 2. Simpan data baru ke glmut (POST)
app.post('/api/table-glmut', (req, res) => {
    const { id, no_bill, tanggal, urai, perkiraan, debet, kredit, total } = req.body;

    if (!no_bill || !tanggal) {
        return res.status(400).json({ error: 'No Bill dan Tanggal wajib diisi' });
    }

    const query = `
        INSERT INTO glmut (id, no_bill, tanggal, urai, perkiraan, debet, kredit, total)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    const values = [
        id || null, 
        no_bill, 
        tanggal, 
        urai, 
        perkiraan, 
        debet || 0, 
        kredit || 0, 
        total || 0
    ];

    db.query(query, values, (err, result) => {
        if (err) {
            console.error('Error SQL Insert:', err);
            return res.status(500).json({ error: 'Gagal menyimpan data' });
        }
        res.json({ message: 'Data berhasil disimpan', insertId: result.insertId });
    });
});

// 3. Ambil satu data berdasarkan ID untuk proses edit (GET)
app.get('/api/table-glmut/:id', (req, res) => {
    const { id } = req.params;
    const query = 'SELECT * FROM glmut WHERE id = ?';
    
    db.query(query, [id], (err, results) => {
        if (err || results.length === 0) {
            return res.status(404).json({ error: 'Data tidak ditemukan' });
        }
        res.json(results[0]);
    });
});

// 4. Update data glmut berdasarkan ID (PUT)
app.put('/api/table-glmut/:id', (req, res) => {
    const { id } = req.params;
    const { no_bill, tanggal, urai, perkiraan, debet, kredit, total } = req.body;

    const query = `
        UPDATE glmut 
        SET no_bill = ?, tanggal = ?, urai = ?, perkiraan = ?, debet = ?, kredit = ?, total = ? 
        WHERE id = ?
    `;
    
    const values = [
        no_bill, 
        tanggal, 
        urai, 
        perkiraan, 
        debet || 0, 
        kredit || 0, 
        total || 0, 
        id
    ];

    db.query(query, values, (err, result) => {
        if (err) {
            console.error('Error SQL Update:', err);
            return res.status(500).json({ error: 'Gagal memperbarui data' });
        }
        res.json({ message: 'Data berhasil diperbarui' });
    });
});

// 5. Hapus data glmut berdasarkan ID (DELETE)
app.delete('/api/table-glmut/:id', (req, res) => {
    const { id } = req.params;
    const query = 'DELETE FROM glmut WHERE id = ?';

    db.query(query, [id], (err, result) => {
        if (err) {
            console.error('Error SQL Delete:', err);
            return res.status(500).json({ error: 'Gagal menghapus data dari database' });
        }
        res.json({ message: 'Data berhasil dihapus' });
    });
});











































app.listen(PORT, () => {
    console.log(`Server berjalan di http://localhost:${PORT}`);
});