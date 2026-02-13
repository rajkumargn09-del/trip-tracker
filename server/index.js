const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const db = require('./database');

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(morgan('dev'));
app.use(bodyParser.json());

// Serve static files from the React app
const path = require('path');
app.use(express.static(path.join(__dirname, '../client/dist')));

// Get all expenses
app.get('/api/expenses', (req, res) => {
    db.all('SELECT * FROM expenses ORDER BY date DESC', [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

// Add new expense
app.post('/api/expenses', (req, res) => {
    const { amount, category, subCategory, purpose, spentBy, date, time } = req.body;
    if (!amount || !category || !spentBy) {
        res.status(400).json({ error: 'Missing required fields' });
        return;
    }

    const sql = `INSERT INTO expenses (amount, category, subCategory, purpose, spentBy, date, time) 
                 VALUES (?, ?, ?, ?, ?, COALESCE(?, date('now')), COALESCE(?, time('now')))`;
    const params = [amount, category, subCategory, purpose, spentBy, date, time];

    db.run(sql, params, function (err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ id: this.lastID });
    });
});

// Update an expense
app.put('/api/expenses/:id', (req, res) => {
    const { id } = req.params;
    const { amount, category, subCategory, purpose, spentBy, date, time } = req.body;

    const sql = `UPDATE expenses SET 
                 amount = ?, category = ?, subCategory = ?, 
                 purpose = ?, spentBy = ?, date = ?, time = ? 
                 WHERE id = ?`;
    const params = [amount, category, subCategory, purpose, spentBy, date, time, id];

    db.run(sql, params, function (err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ updated: this.changes });
    });
});

// Delete an expense
app.delete('/api/expenses/:id', (req, res) => {
    const { id } = req.params;
    db.run('DELETE FROM expenses WHERE id = ?', id, function (err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ deleted: this.changes });
    });
});

// Export all expenses as CSV
app.get('/api/export', (req, res) => {
    db.all('SELECT * FROM expenses ORDER BY date DESC, time DESC', [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }

        const headers = 'ID,Date,Time,Category,Sub-Category,Amount,Spent By,Purpose\n';
        const csv = rows.map(r =>
            `${r.id},"${r.date}","${r.time}","${r.category}","${r.subCategory || ''}",${r.amount},"${r.spentBy}","${r.purpose || ''}"`
        ).join('\n');

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=trip_expenses.csv');
        res.send(headers + csv);
    });
});

// Get summary
app.get('/api/summary', (req, res) => {
    const summary = {};

    db.all('SELECT category, SUM(amount) as total FROM expenses GROUP BY category', [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        summary.byCategory = rows;

        db.all('SELECT spentBy, SUM(amount) as total FROM expenses GROUP BY spentBy', [], (err, rows) => {
            if (err) return res.status(500).json({ error: err.message });
            summary.byPerson = rows;

            db.get('SELECT SUM(amount) as total FROM expenses', [], (err, row) => {
                if (err) return res.status(500).json({ error: err.message });
                summary.totalSpent = row.total || 0;
                res.json(summary);
            });
        });
    });
});

// The "catchall" handler: for any request that doesn't
// match one above, send back React's index.html file.
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
