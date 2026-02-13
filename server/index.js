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
    const { amount, category, purpose, spentBy } = req.body;
    if (!amount || !category || !spentBy) {
        res.status(400).json({ error: 'Missing required fields' });
        return;
    }

    const sql = 'INSERT INTO expenses (amount, category, purpose, spentBy) VALUES (?, ?, ?, ?)';
    const params = [amount, category, purpose, spentBy];

    db.run(sql, params, function (err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ id: this.lastID });
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
