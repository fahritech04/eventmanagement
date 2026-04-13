import { useState, useEffect } from 'react';
import api from '../services/api';
import { formatDateTime, statusLabels, statusBadgeClass } from '../services/helpers';
import { Plus, X, MessageSquare, MapPin, Clock, Video, Users } from 'lucide-react';

export default function MeetingsPage() {
  const [meetings, setMeetings] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

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
      const payload = { ...form, attendees: form.attendees.split(',').map(s => s.trim()).filter(Boolean) };
      await api.post('/api/meetings', payload);
      setShowModal(false); setForm(emptyForm); fetchData();
    } catch (err) { alert(err.response?.data?.error || 'Gagal menyimpan'); }
  };

  const updateStatus = async (id, status) => {
    await api.put(`/api/meetings/${id}`, { status }); fetchData();
  };

  if (loading) return <div className="loading-spinner"><div className="spinner" /></div>;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Meeting</h1>
          <p className="page-subtitle">Jadwal meeting dengan klien dan vendor</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setForm(emptyForm); setShowModal(true); }}>
          <Plus size={18} /> Jadwalkan Meeting
        </button>
      </div>

      <div className="grid-3">
        {meetings.map(m => {
          const meetingDate = new Date(m.meeting_date);
          const isPast = meetingDate < new Date();
          return (
            <div key={m.id} className="card" style={{ opacity: m.status === 'completed' || m.status === 'cancelled' ? 0.6 : 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <div>
                  <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: 4 }}>{m.title}</h3>
                  {m.event_title && <div style={{ fontSize: '0.75rem', color: 'var(--accent-secondary)' }}>{m.event_title}</div>}
                </div>
                <span className={`badge ${statusBadgeClass(m.status)}`}>{statusLabels[m.status] || m.status}</span>
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
                {m.attendees?.length > 0 && (
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)' }}>
                    Peserta: {m.attendees.join(', ')}
                  </div>
                )}
              </div>

              {m.status === 'scheduled' && (
                <div style={{ display: 'flex', gap: 6, marginTop: 14, paddingTop: 12, borderTop: '1px solid var(--border-color)' }}>
                  <button className="btn btn-primary btn-sm" style={{ flex: 1 }} onClick={() => updateStatus(m.id, 'completed')}>Selesai</button>
                  <button className="btn btn-secondary btn-sm" style={{ flex: 1 }} onClick={() => updateStatus(m.id, 'cancelled')}>Batalkan</button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {meetings.length === 0 && (
        <div className="card empty-state">
          <MessageSquare size={48} />
          <h3>Belum ada meeting</h3>
          <p>Klik "Jadwalkan Meeting" untuk membuat jadwal baru</p>
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Jadwalkan Meeting</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}><X size={20} /></button>
            </div>
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
