import { useState, useEffect } from 'react';
import api from '../services/api';
import { formatCurrency, formatDate, statusLabels, statusBadgeClass, paymentTypeLabels } from '../services/helpers';
import { Plus, X, CreditCard, TrendingUp, AlertTriangle, Clock } from 'lucide-react';

export default function PaymentsPage() {
  const [payments, setPayments] = useState([]);
  const [summary, setSummary] = useState(null);
  const [events, setEvents] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [showModal, setShowModal] = useState(false);

  const emptyForm = { event_id: '', vendor_id: '', amount: '', payment_date: '', payment_type: 'dp', payment_method: 'transfer', status: 'pending', invoice_number: '', notes: '' };
  const [form, setForm] = useState(emptyForm);

  useEffect(() => { fetchData(); }, [statusFilter]);

  const fetchData = async () => {
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.set('status', statusFilter);
      const [pRes, sRes, eRes, vRes] = await Promise.all([
        api.get(`/api/payments?${params}`),
        api.get('/api/payments/summary'),
        api.get('/api/events'),
        api.get('/api/vendors'),
      ]);
      setPayments(pRes.data.payments);
      setSummary(sRes.data.summary);
      setEvents(eRes.data.events);
      setVendors(vRes.data.vendors);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/api/payments', form);
      setShowModal(false); setForm(emptyForm); fetchData();
    } catch (err) { alert(err.response?.data?.error || 'Gagal menyimpan'); }
  };

  const updateStatus = async (id, status) => {
    try {
      await api.put(`/api/payments/${id}`, { status, payment_date: status === 'paid' ? new Date().toISOString().split('T')[0] : null });
      fetchData();
    } catch (err) { console.error(err); }
  };

  if (loading) return <div className="loading-spinner"><div className="spinner" /></div>;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Pembayaran</h1>
          <p className="page-subtitle">Lacak semua pembayaran vendor dan klien</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setForm(emptyForm); setShowModal(true); }}>
          <Plus size={18} /> Catat Pembayaran
        </button>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
          <div className="stat-card">
            <div className="stat-card-header">
              <span className="stat-card-label">Total Dibayar</span>
              <div className="stat-card-icon green"><CreditCard size={20} /></div>
            </div>
            <div className="stat-card-value" style={{ color: 'var(--success)', fontSize: '1.4rem' }}>{formatCurrency(summary.total_paid)}</div>
          </div>
          <div className="stat-card">
            <div className="stat-card-header">
              <span className="stat-card-label">Pending</span>
              <div className="stat-card-icon orange"><Clock size={20} /></div>
            </div>
            <div className="stat-card-value" style={{ color: 'var(--warning)', fontSize: '1.4rem' }}>{formatCurrency(summary.total_pending)}</div>
          </div>
          <div className="stat-card">
            <div className="stat-card-header">
              <span className="stat-card-label">Terlambat</span>
              <div className="stat-card-icon red"><AlertTriangle size={20} /></div>
            </div>
            <div className="stat-card-value" style={{ color: 'var(--danger)', fontSize: '1.4rem' }}>{formatCurrency(summary.total_overdue)}</div>
          </div>
          <div className="stat-card">
            <div className="stat-card-header">
              <span className="stat-card-label">Total</span>
              <div className="stat-card-icon purple"><TrendingUp size={20} /></div>
            </div>
            <div className="stat-card-value" style={{ fontSize: '1.4rem' }}>{formatCurrency(summary.total_all)}</div>
          </div>
        </div>
      )}

      <div className="toolbar">
        <div className="toolbar-left">
          <select className="form-input filter-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            <option value="">Semua Status</option>
            <option value="pending">Pending</option>
            <option value="paid">Lunas</option>
            <option value="overdue">Terlambat</option>
          </select>
        </div>
      </div>

      <div className="card">
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Invoice</th>
                <th>Event</th>
                <th>Vendor</th>
                <th>Jumlah</th>
                <th>Tipe</th>
                <th>Metode</th>
                <th>Tanggal</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {payments.map(p => (
                <tr key={p.id}>
                  <td style={{ fontWeight: 600, color: 'var(--accent-secondary)', fontSize: '0.8rem' }}>{p.invoice_number || '-'}</td>
                  <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{p.event_title}</td>
                  <td>{p.vendor_name || '-'}</td>
                  <td style={{ fontFamily: 'Outfit', fontWeight: 700, color: 'var(--text-primary)' }}>{formatCurrency(p.amount)}</td>
                  <td><span className="badge badge-muted">{paymentTypeLabels[p.payment_type] || p.payment_type}</span></td>
                  <td style={{ textTransform: 'capitalize', fontSize: '0.8rem' }}>{p.payment_method || '-'}</td>
                  <td style={{ fontSize: '0.8rem' }}>{formatDate(p.payment_date)}</td>
                  <td><span className={`badge ${statusBadgeClass(p.status)}`}>{statusLabels[p.status] || p.status}</span></td>
                  <td>
                    {p.status === 'pending' && (
                      <button className="btn btn-primary btn-sm" onClick={() => updateStatus(p.id, 'paid')}>Lunas</button>
                    )}
                  </td>
                </tr>
              ))}
              {payments.length === 0 && (
                <tr><td colSpan={9} style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>Belum ada pembayaran</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Catat Pembayaran</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Event *</label>
                  <select className="form-input" value={form.event_id} onChange={e => setForm(p => ({...p, event_id: e.target.value}))} required>
                    <option value="">Pilih event</option>
                    {events.map(e => <option key={e.id} value={e.id}>{e.title}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Vendor</label>
                  <select className="form-input" value={form.vendor_id} onChange={e => setForm(p => ({...p, vendor_id: e.target.value}))}>
                    <option value="">Pilih vendor (opsional)</option>
                    {vendors.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
                  </select>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Jumlah (Rp) *</label>
                    <input type="number" className="form-input" value={form.amount} onChange={e => setForm(p => ({...p, amount: e.target.value}))} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">No. Invoice</label>
                    <input className="form-input" value={form.invoice_number} onChange={e => setForm(p => ({...p, invoice_number: e.target.value}))} />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Tipe</label>
                    <select className="form-input" value={form.payment_type} onChange={e => setForm(p => ({...p, payment_type: e.target.value}))}>
                      {Object.entries(paymentTypeLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Metode</label>
                    <select className="form-input" value={form.payment_method} onChange={e => setForm(p => ({...p, payment_method: e.target.value}))}>
                      <option value="transfer">Transfer Bank</option>
                      <option value="cash">Tunai</option>
                      <option value="qris">QRIS</option>
                      <option value="credit_card">Kartu Kredit</option>
                    </select>
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Catatan</label>
                  <textarea className="form-input" value={form.notes} onChange={e => setForm(p => ({...p, notes: e.target.value}))} rows={2} />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Batal</button>
                <button type="submit" className="btn btn-primary">Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
