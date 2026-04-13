import { useState, useEffect } from 'react';
import api from '../services/api';
import { formatDateTime } from '../services/helpers';
import { Plus, Search, Calendar, MapPin, Clock, Video, Users } from 'lucide-react';
import Modal from '../components/ui/Modal';
import EmptyState from '../components/ui/EmptyState';
import Badge from '../components/ui/Badge';

export default function MeetingsPage() {
  const [meetings, setMeetings] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editMeeting, setEditMeeting] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const emptyForm = { event_id: '', title: '', description: '', meeting_date: '', duration_minutes: '60', location: '', meeting_type: 'offline', meeting_link: '', attendees: '', notes: '' };
  const [form, setForm] = useState(emptyForm);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [mRes, eRes] = await Promise.all([api.get('/api/meetings'), api.get('/api/events')]);
      setMeetings(mRes.data.meetings);
      setEvents(eRes.data.events);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...form, attendees: typeof form.attendees === 'string' ? form.attendees.split(',').map(s => s.trim()).filter(Boolean) : form.attendees };
      if (editMeeting) await api.put(`/api/meetings/${editMeeting.id}`, payload);
      else await api.post('/api/meetings', payload);
      setShowModal(false); setForm(emptyForm); setEditMeeting(null); fetchData();
    } catch (err) { alert(err.response?.data?.error || 'Gagal menyimpan'); }
  };

  const handleDelete = async (id) => {
    if (confirm('Yakin ingin menghapus meeting ini?')) {
      await api.delete(`/api/meetings/${id}`); fetchData();
    }
  };

  const updateStatus = async (id, status) => {
    await api.put(`/api/meetings/${id}`, { status }); fetchData();
  };

  const filteredMeetings = meetings.filter(m => m.title.toLowerCase().includes(searchTerm.toLowerCase()));

  if (loading) return <div className="loading-spinner"><div className="spinner" /></div>;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Meeting</h1>
          <p className="page-subtitle">Jadwal meeting dengan klien dan vendor</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <div className="search-box">
            <Search size={18} />
            <input placeholder="Cari meeting..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
          </div>
          <button className="btn btn-primary" onClick={() => { setEditMeeting(null); setForm(emptyForm); setShowModal(true); }}>
            <Plus size={18} /> Jadwalkan Meeting
          </button>
        </div>
      </div>

      <div className="grid-3">
        {filteredMeetings.map(m => (
          <div key={m.id} className="card" style={{ opacity: m.status === 'completed' || m.status === 'cancelled' ? 0.6 : 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
              <div>
                <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: 4 }}>{m.title}</h3>
                {m.event_title && <div style={{ fontSize: '0.75rem', color: 'var(--accent-secondary)' }}>{m.event_title}</div>}
              </div>
              <Badge status={m.status} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Clock size={14} color="var(--text-muted)" />
                {formatDateTime(m.meeting_date)} · {m.duration_minutes} menit
              </div>
              {m.location && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <MapPin size={14} color="var(--text-muted)" />
                  {m.location}
                </div>
              )}
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                {m.meeting_type === 'online' ? <Video size={14} color="var(--info)" /> : <Users size={14} color="var(--text-muted)" />}
                {m.meeting_type === 'online' ? 'Online' : m.meeting_type === 'hybrid' ? 'Hybrid' : 'Offline'}
              </div>
            </div>

            {m.status === 'scheduled' && (
              <div style={{ display: 'flex', gap: 6, marginTop: 14, paddingTop: 12, borderTop: '1px solid var(--border-color)' }}>
                <button className="btn btn-primary btn-sm" style={{ flex: 1 }} onClick={() => updateStatus(m.id, 'completed')}>Selesai</button>
                <button className="btn btn-secondary btn-sm" style={{ flex: 1 }} onClick={() => updateStatus(m.id, 'cancelled')}>Batalkan</button>
              </div>
            )}
          </div>
        ))}
      </div>

      {filteredMeetings.length === 0 && (
        <EmptyState 
          icon={Calendar} 
          title="Tidak ada meeting" 
          description="Belum ada jadwal meeting yang dibuat." 
        />
      )}

      <Modal 
        isOpen={showModal} 
        onClose={() => setShowModal(false)} 
        title={editMeeting ? 'Edit Meeting' : 'Jadwalkan Meeting Baru'}
      >
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label">Event</label>
              <select className="form-input" value={form.event_id} onChange={e => setForm(p => ({...p, event_id: e.target.value}))}>
                <option value="">Pilih event (opsional)</option>
                {events.map(e => <option key={e.id} value={e.id}>{e.title}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Judul Meeting *</label>
              <input className="form-input" value={form.title} onChange={e => setForm(p => ({...p, title: e.target.value}))} required />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Tanggal & Waktu *</label>
                <input type="datetime-local" className="form-input" value={form.meeting_date} onChange={e => setForm(p => ({...p, meeting_date: e.target.value}))} required />
              </div>
              <div className="form-group">
                <label className="form-label">Durasi (menit)</label>
                <input type="number" className="form-input" value={form.duration_minutes} onChange={e => setForm(p => ({...p, duration_minutes: e.target.value}))} />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Lokasi</label>
                <input className="form-input" value={form.location} onChange={e => setForm(p => ({...p, location: e.target.value}))} />
              </div>
              <div className="form-group">
                <label className="form-label">Tipe</label>
                <select className="form-input" value={form.meeting_type} onChange={e => setForm(p => ({...p, meeting_type: e.target.value}))}>
                  <option value="offline">Offline</option>
                  <option value="online">Online</option>
                  <option value="hybrid">Hybrid</option>
                </select>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Peserta (pisah koma)</label>
              <input className="form-input" value={form.attendees} onChange={e => setForm(p => ({...p, attendees: e.target.value}))} placeholder="Andi, Maya, Sari Dewi" />
            </div>
            <div className="form-group">
              <label className="form-label">Catatan</label>
              <textarea className="form-input" value={form.notes} onChange={e => setForm(p => ({...p, notes: e.target.value}))} rows={2} />
            </div>
          </div>
          <div className="modal-footer">
            {editMeeting && <button type="button" className="btn btn-danger btn-sm" onClick={() => { handleDelete(editMeeting.id); setShowModal(false); }}>Hapus</button>}
            <div style={{ flex: 1 }} />
            <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Batal</button>
            <button type="submit" className="btn btn-primary">{editMeeting ? 'Simpan' : 'Jadwalkan'}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
