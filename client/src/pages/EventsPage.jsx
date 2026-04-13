import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { formatCurrency, formatDate, formatTime, eventTypeLabels } from '../services/helpers';
import { Plus, Search, Calendar, MapPin, Users, Clock } from 'lucide-react';
import Modal from '../components/ui/Modal';
import EmptyState from '../components/ui/EmptyState';
import Badge from '../components/ui/Badge';

export default function EventsPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editEvent, setEditEvent] = useState(null);
  const navigate = useNavigate();

  const emptyForm = { title: '', description: '', client_name: '', client_email: '', client_phone: '', event_date: '', event_time: '', venue: '', venue_address: '', budget: '', event_type: 'wedding', notes: '' };
  const [form, setForm] = useState(emptyForm);

  useEffect(() => { fetchEvents(); }, [search, statusFilter]);

  const fetchEvents = async () => {
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (statusFilter) params.set('status', statusFilter);
      const res = await api.get(`/api/events?${params}`);
      setEvents(res.data.events);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editEvent) {
        await api.put(`/api/events/${editEvent.id}`, form);
      } else {
        await api.post('/api/events', form);
      }
      setShowModal(false);
      setForm(emptyForm);
      setEditEvent(null);
      fetchEvents();
    } catch (err) {
      alert(err.response?.data?.error || 'Gagal menyimpan');
    }
  };

  const openEdit = (event) => {
    setEditEvent(event);
    setForm({
      title: event.title, description: event.description || '', client_name: event.client_name,
      client_email: event.client_email || '', client_phone: event.client_phone || '',
      event_date: event.event_date?.split('T')[0] || '', event_time: event.event_time || '',
      venue: event.venue || '', venue_address: event.venue_address || '',
      budget: event.budget || '', event_type: event.event_type || 'wedding', notes: event.notes || '',
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Yakin ingin menghapus event ini?')) return;
    try {
      await api.delete(`/api/events/${id}`);
      fetchEvents();
    } catch (err) {
      alert(err.response?.data?.error || 'Gagal menghapus');
    }
  };

  if (loading) return <div className="loading-spinner"><div className="spinner" /></div>;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Event</h1>
          <p className="page-subtitle">Kelola semua event dan acara Anda</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setEditEvent(null); setForm(emptyForm); setShowModal(true); }}>
          <Plus size={18} /> Tambah Event
        </button>
      </div>

      <div className="toolbar">
        <div className="toolbar-left">
          <div className="search-input">
            <Search />
            <input className="form-input" placeholder="Cari event atau klien..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select className="form-input filter-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            <option value="">Semua Status</option>
            <option value="planning">Perencanaan</option>
            <option value="in_progress">Berlangsung</option>
            <option value="completed">Selesai</option>
            <option value="cancelled">Dibatalkan</option>
          </select>
        </div>
      </div>

      <div className="events-grid">
        {events.map(event => (
          <div key={event.id} className={`event-card status-${event.status}`} onClick={() => navigate(`/events/${event.id}`)}>
            <div className="event-card-header">
              <div>
                <h3>{event.title}</h3>
                <div className="event-card-client">{event.client_name}</div>
              </div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <Badge status={event.status} />
                <button 
                  className="btn btn-secondary btn-sm" 
                  onClick={(e) => { e.stopPropagation(); openEdit(event); }}
                >
                  Edit
                </button>
              </div>
            </div>

            <div className="event-card-meta">
              <div className="event-card-meta-item"><Calendar size={14} />{formatDate(event.event_date)}</div>
              {event.event_time && <div className="event-card-meta-item"><Clock size={14} />{formatTime(event.event_time)}</div>}
              {event.venue && <div className="event-card-meta-item"><MapPin size={14} />{event.venue}</div>}
              <div className="event-card-meta-item"><Users size={14} />{event.vendor_count || 0} vendor</div>
            </div>

            <div className="event-card-footer">
              <div>
                <span className={`badge ${statusBadgeClass(event.event_type === 'wedding' ? 'planning' : event.event_type === 'corporate' ? 'in_progress' : 'pending')}`}>
                  {eventTypeLabels[event.event_type] || event.event_type}
                </span>
              </div>
              <div className="event-budget">{formatCurrency(event.budget)}</div>
            </div>
          </div>
        ))}
        {events.length === 0 && (
          <EmptyState 
            icon={Calendar} 
            title="Belum ada event" 
            description="Klik 'Tambah Event' untuk membuat event baru" 
          />
        )}
      </div>

      <Modal 
        isOpen={showModal} 
        onClose={() => setShowModal(false)} 
        title={editEvent ? 'Edit Event' : 'Tambah Event Baru'}
      >
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Judul Event *</label>
                  <input className="form-input" value={form.title} onChange={e => setForm(p => ({...p, title: e.target.value}))} required placeholder="Pernikahan Andi & Maya" />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Nama Klien *</label>
                    <input className="form-input" value={form.client_name} onChange={e => setForm(p => ({...p, client_name: e.target.value}))} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Telepon Klien</label>
                    <input className="form-input" value={form.client_phone} onChange={e => setForm(p => ({...p, client_phone: e.target.value}))} />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Tanggal Event *</label>
                    <input type="date" className="form-input" value={form.event_date} onChange={e => setForm(p => ({...p, event_date: e.target.value}))} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Waktu</label>
                    <input type="time" className="form-input" value={form.event_time} onChange={e => setForm(p => ({...p, event_time: e.target.value}))} />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Venue</label>
                    <input className="form-input" value={form.venue} onChange={e => setForm(p => ({...p, venue: e.target.value}))} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Tipe Event</label>
                    <select className="form-input" value={form.event_type} onChange={e => setForm(p => ({...p, event_type: e.target.value}))}>
                      <option value="wedding">Pernikahan</option>
                      <option value="corporate">Korporat</option>
                      <option value="birthday">Ulang Tahun</option>
                      <option value="other">Lainnya</option>
                    </select>
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Budget</label>
                  <input type="number" className="form-input" value={form.budget} onChange={e => setForm(p => ({...p, budget: e.target.value}))} placeholder="250000000" />
                </div>
                <div className="form-group">
                  <label className="form-label">Catatan</label>
                  <textarea className="form-input" value={form.notes} onChange={e => setForm(p => ({...p, notes: e.target.value}))} rows={3} />
                </div>
                {editEvent && (
                  <div className="form-group">
                    <label className="form-label">Status</label>
                    <select className="form-input" value={form.status || editEvent.status} onChange={e => setForm(p => ({...p, status: e.target.value}))}>
                      <option value="planning">Perencanaan</option>
                      <option value="in_progress">Berlangsung</option>
                      <option value="completed">Selesai</option>
                      <option value="cancelled">Dibatalkan</option>
                    </select>
                  </div>
                )}
          </div>
          <div className="modal-footer">
            {editEvent && <button type="button" className="btn btn-danger btn-sm" onClick={() => { handleDelete(editEvent.id); setShowModal(false); }}>Hapus</button>}
            <div style={{ flex: 1 }} />
            <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Batal</button>
            <button type="submit" className="btn btn-primary">{editEvent ? 'Simpan' : 'Buat Event'}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
