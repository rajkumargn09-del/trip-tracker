import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import { PlusCircle, Wallet, LayoutDashboard, History, User, Download, Edit2, Check, X } from 'lucide-react';
import './index.css';

const API_URL = '/api';
const COLORS = ['#6366f1', '#a855f7', '#ec4899', '#f59e0b', '#10b981'];

const CATEGORIES = {
  'Food': ['lunch', 'breakfast', 'dinner', 'snacks', 'others'],
  'Transport': ['fuel', 'parking', 'Toll Charge', 'driver', 'others'],
  'Accommodation': ['hotel', 'waiter', 'others'],
  'Temple': ['Tickets', 'Prasadam', 'Pooja', 'donation', 'others'],
  'Entertainment': ['others'],
  'Others': ['others']
};

const SPENT_BY = ['Rajkumar', 'Ramesh', 'Bhavani', 'Uday', 'Shiva', 'Vishal', 'Others'];

function App() {
  const [expenses, setExpenses] = useState([]);
  const [summary, setSummary] = useState({ totalSpent: 0, byCategory: [], byPerson: [] });
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);

  const getInitialForm = () => ({
    amount: '',
    category: 'Food',
    subCategory: 'lunch',
    purpose: '',
    spentBy: 'Rajkumar',
    date: new Date().toISOString().split('T')[0],
    time: new Date().toTimeString().split(' ')[0].slice(0, 5)
  });

  const [formData, setFormData] = useState(getInitialForm());

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

  const handleCategoryChange = (cat) => {
    setFormData({
      ...formData,
      category: cat,
      subCategory: CATEGORIES[cat][0]
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await axios.put(`${API_URL}/expenses/${editingId}`, formData);
        setEditingId(null);
      } else {
        await axios.post(`${API_URL}/expenses`, formData);
      }
      setFormData(getInitialForm());
      fetchData();
    } catch (err) {
      console.error('Error saving expense', err);
    }
  };

  const startEdit = (exp) => {
    setEditingId(exp.id);
    setFormData({
      amount: exp.amount,
      category: exp.category,
      subCategory: exp.subCategory,
      purpose: exp.purpose,
      spentBy: exp.spentBy,
      date: exp.date,
      time: exp.time
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const downloadCSV = () => {
    window.open(`${API_URL}/export`, '_blank');
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
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <PlusCircle size={20} color="var(--accent-primary)" />
              <h2>{editingId ? 'Update Transaction' : 'Add New Expense'}</h2>
            </div>
            {editingId && (
              <button onClick={() => { setEditingId(null); setFormData(getInitialForm()); }} className="btn-icon">
                <X size={18} />
              </button>
            )}
          </div>
          <form onSubmit={handleSubmit} className="grid" style={{ gap: '1rem' }}>
            <div className="grid grid-cols-2" style={{ gap: '1rem' }}>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                required
              />
              <input
                type="time"
                value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                required
              />
            </div>
            <input
              type="number"
              placeholder="Amount (₹)"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              required
            />
            <div className="grid grid-cols-2" style={{ gap: '1rem' }}>
              <select
                value={formData.category}
                onChange={(e) => handleCategoryChange(e.target.value)}
              >
                {Object.keys(CATEGORIES).map(cat => <option key={cat}>{cat}</option>)}
              </select>
              <select
                value={formData.subCategory}
                onChange={(e) => setFormData({ ...formData, subCategory: e.target.value })}
              >
                {CATEGORIES[formData.category].map(sub => <option key={sub}>{sub}</option>)}
              </select>
            </div>
            <select
              value={formData.spentBy}
              onChange={(e) => setFormData({ ...formData, spentBy: e.target.value })}
            >
              {SPENT_BY.map(name => <option key={name}>{name}</option>)}
            </select>
            <input
              type="text"
              placeholder="Purpose (optional)"
              value={formData.purpose}
              onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
            />
            <button type="submit">
              {editingId ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center' }}>
                  <Check size={18} /> Update Record
                </div>
              ) : 'Add Transaction'}
            </button>
          </form>
        </section>

        {/* Category Chart */}
        <section className="glass-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h2>Spending by Category</h2>
            <button onClick={downloadCSV} className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Download size={16} /> Export CSV
            </button>
          </div>
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
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600 }}>
                  <span style={{ color: 'var(--text-secondary)', marginRight: '0.5rem' }}>{exp.date} {exp.time}</span>
                  {exp.category} ({exp.subCategory}) - {exp.spentBy}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{exp.purpose || 'No description'}</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ fontWeight: 700, color: 'var(--accent-primary)', fontSize: '1.2rem' }}>
                  ₹{exp.amount.toLocaleString()}
                </div>
                <button onClick={() => startEdit(exp)} className="btn-icon">
                  <Edit2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export default App;
