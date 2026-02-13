import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import { PlusCircle, Wallet, LayoutDashboard, History, User } from 'lucide-react';
import './index.css';

const API_URL = '/api';
const COLORS = ['#6366f1', '#a855f7', '#ec4899', '#f59e0b', '#10b981'];

function App() {
  const [expenses, setExpenses] = useState([]);
  const [summary, setSummary] = useState({ totalSpent: 0, byCategory: [], byPerson: [] });
  const [formData, setFormData] = useState({ amount: '', category: 'Food', purpose: '', spentBy: '' });
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [expRes, sumRes] = await Promise.all([
        axios.get(`${API_URL}/expenses`),
        axios.get(`${API_URL}/summary`)
      ]);
      setExpenses(expRes.data);
      setSummary(sumRes.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching data', err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/expenses`, formData);
      setFormData({ amount: '', category: 'Food', purpose: '', spentBy: '' });
      fetchData();
    } catch (err) {
      console.error('Error adding expense', err);
    }
  };

  return (
    <div className="app-container">
      <header style={{ marginBottom: '3rem', textAlign: 'center' }}>
        <h1 className="title-gradient" style={{ fontSize: '3rem' }}>Trip Expenses</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Track every Penny in Real-time</p>
      </header>

      {/* Summary Section */}
      <section className="grid grid-cols-1 grid-cols-3" style={{ marginBottom: '3rem' }}>
        <div className="glass-card summary-card">
          <Wallet size={24} color="var(--accent-primary)" />
          <div className="summary-label">Total Spent</div>
          <div className="summary-value">₹{summary.totalSpent.toLocaleString()}</div>
        </div>
        <div className="glass-card summary-card">
          <User size={24} color="var(--accent-secondary)" />
          <div className="summary-label">Top Spender</div>
          <div className="summary-value">
            {summary.byPerson[0]?.spentBy || 'N/A'}
          </div>
        </div>
        <div className="glass-card summary-card">
          <LayoutDashboard size={24} color="var(--success)" />
          <div className="summary-label">Categories</div>
          <div className="summary-value">{summary.byCategory.length}</div>
        </div>
      </section>

      <div className="grid grid-cols-1 grid-cols-2">
        {/* Entry Form */}
        <section className="glass-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
            <PlusCircle size={20} color="var(--accent-primary)" />
            <h2>Add New Expense</h2>
          </div>
          <form onSubmit={handleSubmit} className="grid" style={{ gap: '1rem' }}>
            <input
              type="number"
              placeholder="Amount (₹)"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              required
            />
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            >
              <option>Food</option>
              <option>Transport</option>
              <option>Accommodation</option>
              <option>Entertainments</option>
              <option>Others</option>
            </select>
            <input
              type="text"
              placeholder="Spent By (Name)"
              value={formData.spentBy}
              onChange={(e) => setFormData({ ...formData, spentBy: e.target.value })}
              required
            />
            <input
              type="text"
              placeholder="Purpose (optional)"
              value={formData.purpose}
              onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
            />
            <button type="submit">Add Transaction</button>
          </form>
        </section>

        {/* Category Chart */}
        <section className="glass-card">
          <h2>Spending by Category</h2>
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={summary.byCategory}
                  dataKey="total"
                  nameKey="category"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                >
                  {summary.byCategory.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e1e26', border: '1px solid var(--border-color)', borderRadius: '8px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>

      {/* Transactions History */}
      <section className="glass-card" style={{ marginTop: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
          <History size={20} color="var(--accent-secondary)" />
          <h2>Recent Transactions</h2>
        </div>
        <div style={{ overflowX: 'auto' }}>
          {expenses.map((exp) => (
            <div key={exp.id} className="expense-item">
              <div>
                <div style={{ fontWeight: 600 }}>{exp.category} - {exp.spentBy}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{exp.purpose || 'No description'}</div>
              </div>
              <div style={{ fontWeight: 700, color: 'var(--accent-primary)' }}>
                ₹{exp.amount.toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export default App;
