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
    database: 'database_1',

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
app.get('/api/table-group', (req, res) => {
    const query = 'SELECT * FROM `group`';
    db.query(query, (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Gagal mengambil data' });
        }
        res.json(results);
    });
});

app.post('/api/table-group', (req, res) => {
    const { kode, nama, grup } = req.body;

    if (!kode || !nama) {
        return res.status(400).json({ error: 'Code dan Name wajib diisi' });
    }

    const query = 'INSERT INTO `group` (kode, nama, `grup`) VALUES (?, ?, ?)';
    db.query(query, [kode, nama, grup], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Gagal menyimpan data' });
        }
        res.json({ message: 'Data berhasil disimpan', insertId: result.insertId });
    });
});

// === ENDPOINT: TABLE CHART OF ACCOUNTS (COA) ===

// Ambil semua data COA
app.get('/api/table-chart_of_accounts', (req, res) => {
    const query = `
        SELECT 
            coa.kode, 
            coa.nama, 
            coa.rl, 
            coa.grup, 
            g.nama AS nama_grup,
            coa.level,
            coa.saldo_debet, 
            coa.saldo_kredit
        FROM chart_of_accounts coa
        LEFT JOIN \`group\` g ON coa.grup = g.kode
    `;
    
    db.query(query, (err, results) => {
        if (err) return res.status(500).json({ error: 'Gagal mengambil data' });
        res.json(results);
    });
});

// Ambil satu data COA berdasarkan kode (untuk form edit)
app.get('/api/table-chart_of_accounts/:kode', (req, res) => {
    const { kode } = req.params;
    // Gunakan TRIM untuk mengantisipasi spasi ekstra pada data string di database
    db.query('SELECT * FROM chart_of_accounts WHERE TRIM(kode) = TRIM(?)', [kode], (err, results) => {
        if (err || results.length === 0) {
            return res.status(404).json({ error: 'Data tidak ditemukan' });
        }
        res.json(results[0]);
    });
});

// Simpan data baru COA
app.post('/api/table-chart_of_accounts', (req, res) => {
    const { kode, nama, rl, grup, level, saldo_debet, saldo_kredit } = req.body;
    if (!kode || !nama) return res.status(400).json({ error: 'Code dan Name wajib diisi' });

    const query = `INSERT INTO chart_of_accounts (kode, nama, rl, \`grup\`, level, \`saldo_debet\`, \`saldo_kredit\`) VALUES (?, ?, ?, ?, ?, ?, ?)`;
    db.query(query, [kode, nama, rl, grup, level || null, saldo_debet || 0, saldo_kredit || 0], (err, result) => {
        if (err) return res.status(500).json({ error: 'Gagal menyimpan data' });
        res.json({ message: 'Data berhasil disimpan' });
    });
});

// Update data COA
app.put('/api/table-chart_of_accounts/:kode', (req, res) => {
    const { kode } = req.params;
    const { nama, rl, grup, level, saldo_debet, saldo_kredit } = req.body;

    const query = `
        UPDATE chart_of_accounts 
        SET nama = ?, rl = ?, \`grup\` = ?, level = ?, \`saldo_debet\` = ?, \`saldo_kredit\` = ? 
        WHERE TRIM(kode) = TRIM(?)
    `;
    db.query(query, [nama, rl, grup, level || null, saldo_debet || 0, saldo_kredit || 0, kode], (err, result) => {
        if (err) return res.status(500).json({ error: 'Gagal memperbarui data' });
        res.json({ message: 'Data berhasil diperbarui' });
    });
});

// Hapus data COA
app.delete('/api/table-chart_of_accounts/:kode', (req, res) => {
    const { kode } = req.params;
    db.query('DELETE FROM chart_of_accounts WHERE TRIM(kode) = TRIM(?)', [kode], (err, result) => {
        if (err) return res.status(500).json({ error: 'Gagal menghapus data' });
        res.json({ message: 'Data berhasil dihapus' });
    });
});

// === ENDPOINT: TABLE JOURNAL ===
app.get('/api/table-gltemp_k', (req, res) => {
    const query = `SELECT id, voucher, DATE_FORMAT(tanggal, '%Y-%m-%d') AS tanggal, coa, dk, debet, kredit, uraian, user, logtime FROM gltemp_k`;
    db.query(query, (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Gagal mengambil data' });
        }
        res.json(results);
    });
});

app.post('/api/table-gltemp_k', (req, res) => {
    const { voucher, tanggal, coa, dk, debet, kredit, uraian, user } = req.body;

    if (!voucher || !tanggal) {
        return res.status(400).json({ error: 'Voucher dan Tanggal wajib diisi' });
    }

    // Perhatikan jumlah tanda tanya (?) sekarang sudah ada 8 buah pas dengan kolomnya
    const query = `
        INSERT INTO gltemp_k (voucher, tanggal, coa, dk, debet, kredit, uraian, user)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const values = [voucher, tanggal, coa, dk, debet || 0, kredit || 0, uraian, user];

    db.query(query, values, (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Gagal menyimpan data' });
        }
        res.json({ message: 'Data berhasil disimpan', insertId: result.insertId });
    });
});











app.delete('/api/table-gltemp_k/:id', (req, res) => {
    const { id } = req.params;
    const query = 'DELETE FROM `gltemp_k` WHERE id = ?';

    db.query(query, [id], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Gagal menghapus data dari database' });
        }
        res.json({ message: 'Data berhasil dihapus' });
    });
});

app.get('/api/table-gltemp_k/:id', (req, res) => {
    const { id } = req.params;
    const query = 'SELECT * FROM `gltemp_k` WHERE id = ?';

    db.query(query, [id], (err, results) => {
        if (err || results.length === 0) {
            return res.status(404).json({ error: 'Data tidak ditemukan' });
        }
        res.json(results[0]);
    });
});


// Update data group yang sudah diedit
app.put('/api/table-gltemp_k/:id', (req, res) => {
    const { id } = req.params;
    const { tanggal, coa, dk, debet, kredit, uraian, user } = req.body;

    const query = 'UPDATE `gltemp_k` SET tanggal = ?, coa = ?, dk = ?, debet = ?, kredit = ?, uraian = ?, user = ? WHERE id = ?';
    db.query(query, [tanggal, coa, dk, debet, kredit, uraian, user, id], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Gagal memperbarui data' });
        }
        res.json({ message: 'Data berhasil diperbarui' });
    });
});















app.delete('/api/table-group/:kode', (req, res) => {
    const { kode } = req.params;
    const query = 'DELETE FROM `group` WHERE kode = ?';

    db.query(query, [kode], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Gagal menghapus data dari database' });
        }
        res.json({ message: 'Data berhasil dihapus' });
    });
});




// Ambil satu data group berdasarkan kode (untuk form edit)
app.get('/api/table-group/:kode', (req, res) => {
    const { kode } = req.params;
    db.query('SELECT * FROM `group` WHERE kode = ?', [kode], (err, results) => {
        if (err || results.length === 0) {
            return res.status(404).json({ error: 'Data tidak ditemukan' });
        }
        res.json(results[0]);
    });
});

// Update data group yang sudah diedit
app.put('/api/table-group/:kode', (req, res) => {
    const { kode } = req.params;
    const { nama, grup } = req.body;

    const query = 'UPDATE `group` SET nama = ?, `grup` = ? WHERE kode = ?';
    db.query(query, [nama, grup, kode], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Gagal memperbarui data' });
        }
        res.json({ message: 'Data berhasil diperbarui' });
    });
});






app.post('/api/login', (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: 'Username dan password wajib diisi' });
    }

    // Mengambil data dari tabel `login` di database kamu
    const query = 'SELECT * FROM login WHERE username = ? AND password = ?';
    
    db.query(query, [username, password], (err, results) => {
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



























app.get('/api/table-gltemp_h', (req, res) => {
    const query = `SELECT id, voucher, DATE_FORMAT(tanggal, '%Y-%m-%d') AS tanggal, coa, dk, debet, kredit, uraian, user, logtime FROM gltemp_h`;
    db.query(query, (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Gagal mengambil data' });
        }
        res.json(results);
    });
});

app.post('/api/table-gltemp_h', (req, res) => {
    const { voucher, tanggal, coa, dk, debet, kredit, uraian, user } = req.body;

    if (!voucher || !tanggal) {
        return res.status(400).json({ error: 'Voucher dan Tanggal wajib diisi' });
    }

    const query = `
        INSERT INTO gltemp_h (voucher, tanggal, coa, dk, debet, kredit, uraian, user)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const values = [voucher, tanggal, coa, dk, debet || 0, kredit || 0, uraian, user];

    db.query(query, values, (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Gagal menyimpan data' });
        }
        res.json({ message: 'Data berhasil disimpan', insertId: result.insertId });
    });
});

app.delete('/api/table-gltemp_h/:id', (req, res) => {
    const { id } = req.params;
    const query = 'DELETE FROM `gltemp_h` WHERE id = ?';

    db.query(query, [id], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Gagal menghapus data dari database' });
        }
        res.json({ message: 'Data berhasil dihapus' });
    });
});

app.get('/api/table-gltemp_h/:id', (req, res) => {
    const { id } = req.params;
    const query = 'SELECT * FROM `gltemp_h` WHERE id = ?';

    db.query(query, [id], (err, results) => {
        if (err || results.length === 0) {
            return res.status(404).json({ error: 'Data tidak ditemukan' });
        }
        res.json(results[0]);
    });
});


// Update data group yang sudah diedit
app.put('/api/table-gltemp_h/:id', (req, res) => {
    const { id } = req.params;
    const { tanggal, coa, dk, debet, kredit, uraian, user } = req.body;

    const query = 'UPDATE `gltemp_h` SET tanggal = ?, coa = ?, dk = ?, debet = ?, kredit = ?, uraian = ?, user = ? WHERE id = ?';
    db.query(query, [tanggal, coa, dk, debet, kredit, uraian, user, id], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Gagal memperbarui data' });
        }
        res.json({ message: 'Data berhasil diperbarui' });
    });
});







app.post('/api/posting-gltemp', (req, res) => {
    db.beginTransaction(err => {
        if (err) return res.status(500).json({ error: 'Gagal memulai transaksi' });

        const insertQuery = `
            INSERT INTO gltemp_h (voucher, tanggal, coa, dk, debet, kredit, uraian, user, logtime)
            SELECT voucher, tanggal, coa, dk, debet, kredit, uraian, user, logtime 
            FROM gltemp_k
        `;

        db.query(insertQuery, (err, result) => {
            if (err) {
                return db.rollback(() => {
                    console.error(err);
                    res.status(500).json({ error: 'Gagal memposting data ke gltemp_h' });
                });
            }

            const deleteQuery = 'DELETE FROM gltemp_k';
            db.query(deleteQuery, (err, deleteResult) => {
                if (err) {
                    return db.rollback(() => {
                        console.error(err);
                        res.status(500).json({ error: 'Gagal mengosongkan gltemp_k' });
                    });
                }

                db.commit(err => {
                    if (err) {
                        return db.rollback(() => {
                            res.status(500).json({ error: 'Gagal melakukan commit transaksi' });
                        });
                    }
                    res.json({ message: 'Data berhasil diposting ke gltemp_h!' });
                });
            });
        });
    });
});













app.get('/api/buku-besar', (req, res) => {
    let { dari_tanggal, sampai_tanggal, coa } = req.query;

    if (!dari_tanggal || !sampai_tanggal) {
        return res.status(400).json({ error: 'Dari Tanggal dan Sampai Tanggal wajib diisi' });
    }

    let query = `
        SELECT id, voucher, DATE_FORMAT(tanggal, '%Y-%m-%d') AS tanggal, coa, dk, debet, kredit, uraian, user, logtime 
        FROM gltemp_h 
        WHERE tanggal BETWEEN ? AND ?
    `;
    let queryParams = [dari_tanggal, sampai_tanggal];

    if (coa && coa.trim() !== '') {
        query += ` AND coa = ?`;
        queryParams.push(coa);
    }

    query += ` ORDER BY tanggal ASC`;

    db.query(query, queryParams, (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Gagal mengambil data buku besar' });
        }
        res.json(results);
    });
});

















app.listen(PORT, () => {
    console.log(`Server berjalan di http://localhost:${PORT}`);
});