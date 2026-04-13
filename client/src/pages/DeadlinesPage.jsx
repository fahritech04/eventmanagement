import { useState, useEffect } from 'react';
import api from '../services/api';
import { formatDateTime, getDeadlineUrgency, getDeadlineTimeLabel, statusBadgeClass, priorityLabels } from '../services/helpers';
import { Plus, Clock, CheckCircle } from 'lucide-react';
import Modal from '../components/ui/Modal';
import EmptyState from '../components/ui/EmptyState';
import Badge from '../components/ui/Badge';

export default function DeadlinesPage() {
  const [deadlines, setDeadlines] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);

  const emptyForm = { event_id: '', title: '', description: '', due_date: '', priority: 'medium', assigned_to: '' };
  const [form, setForm] = useState(emptyForm);

  useEffect(() => { fetchData(); }, [statusFilter, priorityFilter]);

  const fetchData = async () => {
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.set('status', statusFilter);
      if (priorityFilter) params.set('priority', priorityFilter);
      const [dRes, eRes] = await Promise.all([
        api.get(`/api/deadlines?${params}`),
        api.get('/api/events'),
      ]);
      setDeadlines(dRes.data.deadlines);
      setEvents(eRes.data.events);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editItem) {
        await api.put(`/api/deadlines/${editItem.id}`, form);
      } else {
        await api.post('/api/deadlines', form);
      }
      setShowModal(false); setForm(emptyForm); setEditItem(null); fetchData();
    } catch (err) { alert(err.response?.data?.error || 'Gagal menyimpan'); }
  };

  const toggleComplete = async (d) => {
    try {
      const newStatus = d.status === 'completed' ? 'pending' : 'completed';
      await api.put(`/api/deadlines/${d.id}`, { status: newStatus });
      fetchData();
    } catch (err) { console.error(err); }
  };

  const openEdit = (d) => {
    setEditItem(d);
    setForm({
      event_id: d.event_id, title: d.title, description: d.description || '',
      due_date: d.due_date ? new Date(d.due_date).toISOString().slice(0, 16) : '',
      priority: d.priority, assigned_to: d.assigned_to || '', status: d.status,
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Yakin hapus deadline ini?')) return;
    await api.delete(`/api/deadlines/${id}`); fetchData();
  };

  if (loading) return <div className="loading-spinner"><div className="spinner" /></div>;

  const grouped = { overdue: [], urgent: [], soon: [], ontrack: [], completed: [] };
  deadlines.forEach(d => {
    const urgency = getDeadlineUrgency(d.due_date, d.status);
    grouped[urgency]?.push(d);
  });

  const urgencyMeta = {
    overdue: { label: '🔴 Terlambat / Kurang dari 24 Jam', color: 'var(--danger)' },
    urgent: { label: '🟡 Mendesak (48 Jam)', color: 'var(--warning)' },
    soon: { label: '🔵 Segera (7 Hari)', color: 'var(--info)' },
    ontrack: { label: '🟢 Aman', color: 'var(--success)' },
    completed: { label: '✅ Selesai', color: 'var(--text-muted)' },
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Deadline Tracker</h1>
          <p className="page-subtitle">Pantau semua tenggat waktu dengan indikator visual</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setEditItem(null); setForm(emptyForm); setShowModal(true); }}>
          <Plus size={18} /> Tambah Deadline
        </button>
      </div>

      <div className="toolbar">
        <div className="toolbar-left">
          <select className="form-input filter-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            <option value="">Semua Status</option>
            <option value="pending">Menunggu</option>
            <option value="in_progress">Berlangsung</option>
            <option value="completed">Selesai</option>
            <option value="overdue">Terlambat</option>
          </select>
          <select className="form-input filter-select" value={priorityFilter} onChange={e => setPriorityFilter(e.target.value)}>
            <option value="">Semua Prioritas</option>
            <option value="urgent">Mendesak</option>
            <option value="high">Tinggi</option>
            <option value="medium">Sedang</option>
            <option value="low">Rendah</option>
          </select>
        </div>
        <div style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>
          Total: {deadlines.length} deadline
        </div>
      </div>

      {Object.entries(grouped).map(([key, items]) => {
        if (items.length === 0) return null;
        const meta = urgencyMeta[key];
        return (
          <div key={key} style={{ marginBottom: 24 }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: 10, color: meta.color, display: 'flex', alignItems: 'center', gap: 8 }}>
              {meta.label}
              <span style={{ fontSize: '0.72rem', fontWeight: 500, color: 'var(--text-muted)' }}>({items.length})</span>
            </div>
            <div className="deadline-list">
              {items.map(d => {
                const urgency = getDeadlineUrgency(d.due_date, d.status);
                return (
                  <div key={d.id} className={`deadline-item ${urgency}`}>
                    <button
                      onClick={() => toggleComplete(d)}
                      style={{ background: 'none', display: 'flex', padding: 4, color: d.status === 'completed' ? 'var(--success)' : 'var(--text-muted)' }}
                      title={d.status === 'completed' ? 'Tandai belum selesai' : 'Tandai selesai'}
                    >
                      <CheckCircle size={20} />
                    </button>
                    <div className="deadline-item-content" onClick={() => openEdit(d)} style={{ cursor: 'pointer' }}>
                      <div className="deadline-item-title" style={{ textDecoration: d.status === 'completed' ? 'line-through' : 'none' }}>
                        {d.title}
                      </div>
                      <div className="deadline-item-event">
                        {d.event_title} · {d.assigned_to || '-'} · <Badge className={statusBadgeClass(d.priority)}>{priorityLabels[d.priority]}</Badge>
                      </div>
                    </div>
                    <div className="deadline-item-time" style={{
                      color: urgency === 'overdue' ? 'var(--danger)' : urgency === 'urgent' ? 'var(--warning)' : 'var(--text-secondary)'
                    }}>
                      <div>{getDeadlineTimeLabel(d.due_date, d.status)}</div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{formatDateTime(d.due_date)}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      {deadlines.length === 0 && (
        <EmptyState icon={Clock} title="Belum ada deadline" description="Klik 'Tambah Deadline' untuk membuat deadline baru" />
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editItem ? 'Edit Deadline' : 'Tambah Deadline'}>
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
              <label className="form-label">Judul Deadline *</label>
              <input className="form-input" value={form.title} onChange={e => setForm(p => ({...p, title: e.target.value}))} required />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Jatuh Tempo *</label>
                <input type="datetime-local" className="form-input" value={form.due_date} onChange={e => setForm(p => ({...p, due_date: e.target.value}))} required />
              </div>
              <div className="form-group">
                <label className="form-label">Prioritas</label>
                <select className="form-input" value={form.priority} onChange={e => setForm(p => ({...p, priority: e.target.value}))}>
                  {Object.entries(priorityLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Ditugaskan ke</label>
              <input className="form-input" value={form.assigned_to} onChange={e => setForm(p => ({...p, assigned_to: e.target.value}))} placeholder="Nama penanggung jawab" />
            </div>
            <div className="form-group">
              <label className="form-label">Deskripsi</label>
              <textarea className="form-input" value={form.description} onChange={e => setForm(p => ({...p, description: e.target.value}))} rows={2} />
            </div>
            {editItem && (
              <div className="form-group">
                <label className="form-label">Status</label>
                <select className="form-input" value={form.status} onChange={e => setForm(p => ({...p, status: e.target.value}))}>
                  <option value="pending">Menunggu</option>
                  <option value="in_progress">Berlangsung</option>
                  <option value="completed">Selesai</option>
                </select>
              </div>
            )}
          </div>
          <div className="modal-footer">
            {editItem && <button type="button" className="btn btn-danger btn-sm" onClick={() => { handleDelete(editItem.id); setShowModal(false); }}>Hapus</button>}
            <div style={{ flex: 1 }} />
            <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Batal</button>
            <button type="submit" className="btn btn-primary">{editItem ? 'Simpan' : 'Tambah'}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
