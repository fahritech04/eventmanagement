import { useState, useEffect } from 'react';
import api from '../services/api';
import { formatDateTime } from '../services/helpers';
import { Globe, Plus, Trash2, CheckCircle, AlertTriangle, Play, RefreshCw, Server, Search, X, Settings, Send, XCircle, Zap } from 'lucide-react';
import Modal from '../components/ui/Modal';
import EmptyState from '../components/ui/EmptyState';
import Badge from '../components/ui/Badge';

export default function WebhooksPage() {
  const [configs, setConfigs] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState('configs');
  const [testResult, setTestResult] = useState(null);

  const emptyForm = { url: '', secret: '', events_subscribed: ['deadline.approaching', 'deadline.overdue', 'payment.due', 'event.reminder'] };
  const [form, setForm] = useState(emptyForm);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [cRes, lRes] = await Promise.all([
        api.get('/api/webhooks/configs'),
        api.get('/api/webhooks/logs'),
      ]);
      setConfigs(cRes.data.webhooks);
      setLogs(lRes.data.logs);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/api/webhooks/configs', form);
      setShowModal(false); setForm(emptyForm); fetchData();
    } catch (err) { alert(err.response?.data?.error || 'Gagal menyimpan'); }
  };

  const toggleActive = async (config) => {
    await api.put(`/api/webhooks/configs/${config.id}`, { is_active: !config.is_active });
    fetchData();
  };

  const testWebhook = async (id) => {
    setTestResult(null);
    try {
      const res = await api.post(`/api/webhooks/configs/${id}/test`);
      setTestResult(res.data);
      fetchData();
    } catch (err) {
      setTestResult({ message: 'Gagal mengirim test', result: { success: false, error: err.message } });
    }
  };

  const deleteConfig = async (id) => {
    if (!confirm('Yakin hapus webhook ini?')) return;
    await api.delete(`/api/webhooks/configs/${id}`);
    fetchData();
  };

  if (loading) return <div className="loading-spinner"><div className="spinner" /></div>;

  const eventTypeLabels = {
    'deadline.approaching': 'Deadline Mendekat',
    'deadline.overdue': 'Deadline Terlambat',
    'payment.due': 'Pembayaran Jatuh Tempo',
    'event.reminder': 'Pengingat Event',
    'test': 'Test',
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Webhook</h1>
          <p className="page-subtitle">Konfigurasi webhook untuk notifikasi otomatis (n8n, WhatsApp, dll)</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setForm(emptyForm); setShowModal(true); }}>
          <Plus size={18} /> Tambah Webhook
        </button>
      </div>

      {/* Info Card */}
      <div className="card" style={{ marginBottom: 20, borderColor: 'var(--border-accent)', background: 'var(--accent-glow)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div className="stat-card-icon purple"><Zap size={20} /></div>
          <div>
            <h3 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: 2 }}>Integrasi dengan n8n / Automation Tools</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Tambahkan URL webhook dari n8n untuk menerima notifikasi otomatis saat deadline mendekat. 
              Dari n8n, Anda bisa mengatur pengiriman pesan WhatsApp ke klien atau vendor.
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs">
        <button className={`tab ${activeTab === 'configs' ? 'active' : ''}`} onClick={() => setActiveTab('configs')}>Konfigurasi</button>
        <button className={`tab ${activeTab === 'logs' ? 'active' : ''}`} onClick={() => setActiveTab('logs')}>Log Pengiriman ({logs.length})</button>
      </div>

      {testResult && (
        <div className={`card`} style={{ marginBottom: 16, borderColor: testResult.result?.success ? 'var(--success-border)' : 'var(--danger-border)', background: testResult.result?.success ? 'var(--success-bg)' : 'var(--danger-bg)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {testResult.result?.success ? <CheckCircle size={18} color="var(--success)" /> : <XCircle size={18} color="var(--danger)" />}
            <span style={{ fontWeight: 600 }}>{testResult.message}</span>
          </div>
        </div>
      )}

      {activeTab === 'configs' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {configs.map(c => (
            <div key={c.id} className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                    <Badge status={c.is_active ? 'success' : 'muted'} label={c.is_active ? 'Aktif' : 'Nonaktif'} type="generic" />
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Dibuat: {formatDateTime(c.created_at)}</span>
                  </div>
                  <div style={{ fontFamily: 'monospace', fontSize: '0.8rem', color: 'var(--accent-secondary)', background: 'rgba(139,92,246,0.08)', padding: '8px 12px', borderRadius: 'var(--radius-sm)', marginBottom: 10, wordBreak: 'break-all' }}>
                    {c.url}
                  </div>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {c.events_subscribed?.map(e => (
                      <Badge key={e} status="info" label={eventTypeLabels[e] || e} type="generic" />
                    ))}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 6, marginLeft: 16 }}>
                  <button className="btn btn-secondary btn-sm" onClick={() => testWebhook(c.id)}><Send size={14} /> Test</button>
                  <button className="btn btn-secondary btn-sm" onClick={() => toggleActive(c)}>{c.is_active ? 'Nonaktifkan' : 'Aktifkan'}</button>
                  <button className="btn btn-danger btn-sm" onClick={() => deleteConfig(c.id)}>Hapus</button>
                </div>
              </div>
            </div>
          ))}
          {configs.length === 0 && (
            <EmptyState 
              icon={Settings} 
              title="Belum ada webhook" 
              description="Tambahkan URL webhook untuk menerima notifikasi otomatis" 
            />
          )}
        </div>
      )}

      {activeTab === 'logs' && (
        <div className="card">
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Waktu</th>
                  <th>Event</th>
                  <th>URL</th>
                  <th>Status</th>
                  <th>Response</th>
                </tr>
              </thead>
              <tbody>
                {logs.map(l => (
                  <tr key={l.id}>
                    <td style={{ fontSize: '0.8rem', whiteSpace: 'nowrap' }}>{formatDateTime(l.sent_at)}</td>
                    <td><Badge status="info" label={eventTypeLabels[l.event_type] || l.event_type} type="generic" /></td>
                    <td style={{ fontSize: '0.72rem', fontFamily: 'monospace', color: 'var(--text-tertiary)', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis' }}>{l.webhook_url}</td>
                    <td>
                      <Badge status={l.status_code >= 200 && l.status_code < 300 ? 'success' : 'danger'} label={l.status_code >= 200 && l.status_code < 300 ? 'Success' : 'Failed'} type="generic" />
                    </td>
                    <td style={{ fontSize: '0.75rem', color: l.error ? 'var(--danger)' : 'var(--text-tertiary)' }}>{l.error || l.response || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {logs.length === 0 && (
              <EmptyState 
                icon={Server} 
                title="Tidak ada aktivitas webhook" 
                description="Belum ada webhook yang terkirim." 
              />
            )}
          </div>
        </div>
      )}

      <Modal 
        isOpen={showModal} 
        onClose={() => setShowModal(false)} 
        title="Tambah Webhook"
      >
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label">URL Webhook *</label>
              <input className="form-input" value={form.url} onChange={e => setForm(p => ({...p, url: e.target.value}))} required placeholder="https://n8n.example.com/webhook/xxx" />
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 4 }}>URL dari n8n Webhook Trigger node atau tool automasi lainnya</div>
            </div>
            <div className="form-group">
              <label className="form-label">Secret (opsional)</label>
              <input className="form-input" value={form.secret} onChange={e => setForm(p => ({...p, secret: e.target.value}))} placeholder="webhook-secret-key" />
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 4 }}>Untuk verifikasi HMAC signature di sisi penerima</div>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Batal</button>
            <button type="submit" className="btn btn-primary">Simpan</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
