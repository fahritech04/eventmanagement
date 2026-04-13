import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { formatCurrency, formatDate, formatTime, getDeadlineTimeLabel, getDeadlineUrgency } from '../services/helpers';
import { ArrowLeft, Calendar, MapPin, Phone, Mail, Clock, CreditCard, MessageSquare, Users, Plus } from 'lucide-react';
import Modal from '../components/ui/Modal';
import EmptyState from '../components/ui/EmptyState';
import Badge from '../components/ui/Badge';

export default function EventDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [allVendors, setAllVendors] = useState([]);
  
  // Modals state
  const [modalType, setModalType] = useState(null); // 'vendor', 'deadline', 'payment', 'meeting'
  const [form, setForm] = useState({});

  useEffect(() => {
    fetchEventDetail();
  }, [id]);

  const fetchEventDetail = async () => {
    try {
      const res = await api.get(`/api/events/${id}`);
      setData(res.data);
      
      // If we need to assign vendors, we fetch all vendors
      const vRes = await api.get('/api/vendors');
      setAllVendors(vRes.data.vendors);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (type) => {
    setModalType(type);
    if (type === 'vendor') setForm({ vendor_id: '', agreed_price: '', notes: '' });
    if (type === 'deadline') setForm({ event_id: id, title: '', description: '', due_date: '', priority: 'medium', assigned_to: '' });
    if (type === 'payment') setForm({ event_id: id, vendor_id: '', amount: '', payment_date: '', payment_type: 'dp', payment_method: 'transfer', status: 'pending', notes: '' });
    if (type === 'meeting') setForm({ event_id: id, title: '', description: '', meeting_date: '', duration_minutes: '60', location: '', meeting_type: 'offline', attendees: '', notes: '' });
  };

  const handleCloseModal = () => {
    setModalType(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (modalType === 'vendor') {
        await api.post(`/api/events/${id}/vendors`, form);
      } else if (modalType === 'deadline') {
        await api.post('/api/deadlines', form);
      } else if (modalType === 'payment') {
        await api.post('/api/payments', form);
      } else if (modalType === 'meeting') {
        const payload = { ...form, attendees: form.attendees ? form.attendees.split(',').map(s => s.trim()).filter(Boolean) : [] };
        await api.post('/api/meetings', payload);
      }
      handleCloseModal();
      fetchEventDetail(); // Refresh data
    } catch (err) {
      alert(err.response?.data?.error || 'Gagal menyimpan');
    }
  };

  if (loading) return <div className="loading-spinner"><div className="spinner" /></div>;
  if (!data) return <div className="empty-state"><h3>Event tidak ditemukan</h3><button className="btn btn-secondary mt-4" onClick={() => navigate('/events')}>Kembali</button></div>;

  const { event, vendors, deadlines, payments, meetings } = data;

  return (
    <div>
      <div className="page-header" style={{ marginBottom: 16 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
            <button className="btn-icon" onClick={() => navigate('/events')} style={{ background: 'var(--bg-card)' }}>
              <ArrowLeft size={18} />
            </button>
            <h1 className="page-title" style={{ margin: 0 }}>{event.title}</h1>
            <Badge status={event.status} />
          </div>
          <p className="page-subtitle" style={{ marginLeft: 44 }}>{event.client_name} · {event.client_phone}</p>
        </div>
      </div>

      <div className="tabs" style={{ marginBottom: 24, marginLeft: 44 }}>
        <button className={`tab ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>Overview</button>
        <button className={`tab ${activeTab === 'vendors' ? 'active' : ''}`} onClick={() => setActiveTab('vendors')}>Vendors ({vendors.length})</button>
        <button className={`tab ${activeTab === 'deadlines' ? 'active' : ''}`} onClick={() => setActiveTab('deadlines')}>Deadlines ({deadlines.length})</button>
        <button className={`tab ${activeTab === 'payments' ? 'active' : ''}`} onClick={() => setActiveTab('payments')}>Pembayaran ({payments.length})</button>
        <button className={`tab ${activeTab === 'meetings' ? 'active' : ''}`} onClick={() => setActiveTab('meetings')}>Meetings ({meetings.length})</button>
      </div>

      <div style={{ marginLeft: 44 }}>
        {activeTab === 'overview' && (
          <div className="grid-2">
            <div className="card">
              <h3 className="chart-title" style={{ marginBottom: 16 }}>Detail Event</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, fontSize: '0.9rem' }}>
                <div style={{ display: 'flex', gap: 10 }}><Calendar size={16} color="var(--text-muted)" /> <span>{formatDate(event.event_date)}</span></div>
                {event.event_time && <div style={{ display: 'flex', gap: 10 }}><Clock size={16} color="var(--text-muted)" /> <span>{formatTime(event.event_time)}</span></div>}
                {event.venue && <div style={{ display: 'flex', gap: 10 }}><MapPin size={16} color="var(--text-muted)" /> <span>{event.venue} <br/><span style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>{event.venue_address}</span></span></div>}
                <div style={{ display: 'flex', gap: 10 }}><CreditCard size={16} color="var(--text-muted)" /> <span>Budget: {formatCurrency(event.budget)}</span></div>
                <div style={{ display: 'flex', gap: 10 }}><Users size={16} color="var(--text-muted)" /> <span>Tipe: <span style={{ textTransform: 'capitalize' }}>{event.event_type}</span></span></div>
                {event.description && <div style={{ marginTop: 8, padding: 12, background: 'var(--bg-glass)', borderRadius: 'var(--radius-sm)', fontSize: '0.85rem' }}>{event.description}</div>}
              </div>
            </div>

            <div className="card">
              <h3 className="chart-title" style={{ marginBottom: 16 }}>Kontak Klien</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, fontSize: '0.9rem' }}>
                <div style={{ display: 'flex', gap: 10 }}><Users size={16} color="var(--text-muted)" /> <span style={{ fontWeight: 600 }}>{event.client_name}</span></div>
                {event.client_phone && <div style={{ display: 'flex', gap: 10 }}><Phone size={16} color="var(--text-muted)" /> <span>{event.client_phone}</span></div>}
                {event.client_email && <div style={{ display: 'flex', gap: 10 }}><Mail size={16} color="var(--text-muted)" /> <span>{event.client_email}</span></div>}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'vendors' && (
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
              <h3 className="chart-title">Daftar Vendor</h3>
              <button className="btn btn-secondary btn-sm" onClick={() => handleOpenModal('vendor')}><Plus size={14}/> Hubungkan Vendor</button>
            </div>
            {vendors.length > 0 ? (
              <div className="table-container">
                <table>
                  <thead><tr><th>Vendor</th><th>Kategori</th><th>Telepon</th><th>Harga Disepakati</th><th>Status</th></tr></thead>
                  <tbody>
                    {vendors.map(v => (
                      <tr key={v.id}>
                        <td style={{ fontWeight: 600 }}>{v.vendor_name}</td>
                        <td><span className="badge badge-purple">{v.category}</span></td>
                        <td>{v.vendor_phone || '-'}</td>
                        <td style={{ fontFamily: 'Outfit', fontWeight: 600 }}>{formatCurrency(v.agreed_price)}</td>
                        <td><Badge status={v.payment_status} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : <EmptyState icon={Users} description="Belum ada vendor yang ditambahkan." />}
          </div>
        )}

        {activeTab === 'deadlines' && (
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
              <h3 className="chart-title">Timeline Deadline</h3>
              <button className="btn btn-secondary btn-sm" onClick={() => handleOpenModal('deadline')}><Plus size={14}/> Tambah Deadline</button>
            </div>
            {deadlines.length > 0 ? (
              <div className="deadline-list">
                {deadlines.map(d => {
                  const urgency = getDeadlineUrgency(d.due_date, d.status);
                  return (
                    <div key={d.id} className={`deadline-item ${urgency}`}>
                      <div className={`deadline-indicator deadline-${urgency}`}><div className="deadline-dot" /></div>
                      <div className="deadline-item-content">
                        <div className="deadline-item-title" style={{ textDecoration: d.status === 'completed' ? 'line-through' : 'none' }}>{d.title}</div>
                        <div className="deadline-item-event">Assignee: {d.assigned_to || '-'}</div>
                      </div>
                      <div className="deadline-item-time" style={{ color: urgency === 'overdue' ? 'var(--danger)' : urgency === 'urgent' ? 'var(--warning)' : 'var(--text-secondary)' }}>
                        {getDeadlineTimeLabel(d.due_date, d.status)}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : <EmptyState icon={Clock} description="Belum ada deadline untuk event ini." />}
          </div>
        )}

        {activeTab === 'payments' && (
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
              <h3 className="chart-title">Riwayat Pembayaran</h3>
              <button className="btn btn-secondary btn-sm" onClick={() => handleOpenModal('payment')}><Plus size={14}/> Catat Pembayaran</button>
            </div>
            {payments.length > 0 ? (
               <div className="table-container">
               <table>
                 <thead><tr><th>Invoice</th><th>Vendor</th><th>Tanggal</th><th>Tipe</th><th>Jumlah</th><th>Status</th></tr></thead>
                 <tbody>
                   {payments.map(p => (
                     <tr key={p.id}>
                       <td style={{ fontWeight: 600, fontSize: '0.8rem', color: 'var(--accent-secondary)' }}>{p.invoice_number || '-'}</td>
                       <td>{p.vendor_name || 'Pembayaran Klien'}</td>
                       <td style={{ fontSize: '0.85rem' }}>{formatDate(p.payment_date)}</td>
                       <td><span className="badge badge-muted">{p.payment_type}</span></td>
                       <td style={{ fontFamily: 'Outfit', fontWeight: 600 }}>{formatCurrency(p.amount)}</td>
                       <td><Badge status={p.status} /></td>
                     </tr>
                   ))}
                 </tbody>
               </table>
             </div>
            ) : <EmptyState icon={CreditCard} description="Belum ada riwayat pembayaran." />}
          </div>
        )}

        {activeTab === 'meetings' && (
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
              <h3 className="chart-title">Jadwal Meeting</h3>
              <button className="btn btn-secondary btn-sm" onClick={() => handleOpenModal('meeting')}><Plus size={14}/> Jadwalkan Meeting</button>
            </div>
            {meetings.length > 0 ? (
               <div className="deadline-list">
                 {meetings.map(m => (
                   <div key={m.id} style={{ display: 'flex', padding: 16, borderBottom: '1px solid var(--border-color)', gap: 16 }}>
                     <div style={{ background: 'var(--bg-glass)', padding: 12, borderRadius: 'var(--radius-md)', display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 80 }}>
                       <span style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>{formatDate(m.meeting_date).split(' ')[1]}</span>
                       <span style={{ fontSize: '1.2rem', fontWeight: 700 }}>{formatDate(m.meeting_date).split(' ')[0]}</span>
                     </div>
                     <div style={{ flex: 1 }}>
                       <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                         <div style={{ fontWeight: 600 }}>{m.title}</div>
                         <Badge status={m.status} />
                       </div>
                       <div style={{ display: 'flex', gap: 12, marginTop: 8, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                         {m.location && <span style={{ display: 'flex', gap: 4, alignItems: 'center' }}><MapPin size={12}/>{m.location}</span>}
                         <span style={{ display: 'flex', gap: 4, alignItems: 'center' }}><Clock size={12}/>{formatTime(m.meeting_date.split('T')[1])} ({m.duration_minutes}m)</span>
                       </div>
                       {m.description && <div style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', marginTop: 8 }}>{m.description}</div>}
                     </div>
                   </div>
                 ))}
               </div>
            ) : <EmptyState icon={MessageSquare} description="Belum ada meeting terjadwal." />}
          </div>
        )}
      </div>

      <Modal 
        isOpen={!!modalType}
        onClose={handleCloseModal}
        title={
          modalType === 'vendor' ? 'Hubungkan Vendor' :
          modalType === 'deadline' ? 'Tambah Deadline' :
          modalType === 'payment' ? 'Catat Pembayaran' :
          modalType === 'meeting' ? 'Jadwalkan Meeting' : ''
        }
      >
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
                {modalType === 'vendor' && (
                  <>
                    <div className="form-group">
                      <label className="form-label">Pilih Vendor *</label>
                      <select className="form-input" value={form.vendor_id} onChange={e => setForm({...form, vendor_id: e.target.value})} required>
                        <option value="">-- Pilih Vendor --</option>
                        {allVendors.filter(v => !vendors.some(ev => ev.vendor_id === v.id)).map(v => (
                          <option key={v.id} value={v.id}>{v.name} ({v.category})</option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Harga Disepakati (Rp)</label>
                      <input type="number" className="form-input" value={form.agreed_price} onChange={e => setForm({...form, agreed_price: e.target.value})} />
                    </div>
                  </>
                )}

                {modalType === 'deadline' && (
                  <>
                    <div className="form-group">
                      <label className="form-label">Judul Deadline *</label>
                      <input className="form-input" value={form.title} onChange={e => setForm({...form, title: e.target.value})} required />
                    </div>
                    <div className="form-row">
                      <div className="form-group">
                        <label className="form-label">Jatuh Tempo *</label>
                        <input type="datetime-local" className="form-input" value={form.due_date} onChange={e => setForm({...form, due_date: e.target.value})} required />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Prioritas</label>
                        <select className="form-input" value={form.priority} onChange={e => setForm({...form, priority: e.target.value})}>
                          <option value="low">Rendah</option>
                          <option value="medium">Sedang</option>
                          <option value="high">Tinggi</option>
                          <option value="urgent">Mendesak</option>
                        </select>
                      </div>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Ditugaskan ke</label>
                      <input className="form-input" value={form.assigned_to} onChange={e => setForm({...form, assigned_to: e.target.value})} />
                    </div>
                  </>
                )}

                {modalType === 'payment' && (
                  <>
                    <div className="form-group">
                      <label className="form-label">Jumlah Pembayaran (Rp) *</label>
                      <input type="number" className="form-input" value={form.amount} onChange={e => setForm({...form, amount: e.target.value})} required />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Vendor (Opsional)</label>
                      <select className="form-input" value={form.vendor_id} onChange={e => setForm({...form, vendor_id: e.target.value})}>
                        <option value="">Pembayaran Klien (ke kita)</option>
                        {vendors.map(v => <option key={v.id} value={v.vendor_id}>{v.vendor_name}</option>)}
                      </select>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 4 }}>Pilih vendor jika ini adalah pembayaran keluar.</div>
                    </div>
                    <div className="form-row">
                      <div className="form-group">
                        <label className="form-label">Tipe Pembayaran</label>
                        <select className="form-input" value={form.payment_type} onChange={e => setForm({...form, payment_type: e.target.value})}>
                          <option value="dp">Down Payment</option>
                          <option value="installment">Cicilan</option>
                          <option value="full">Pelunasan</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label className="form-label">Status</label>
                        <select className="form-input" value={form.status} onChange={e => setForm({...form, status: e.target.value})}>
                          <option value="pending">Pending</option>
                          <option value="paid">Lunas</option>
                        </select>
                      </div>
                    </div>
                  </>
                )}

                {modalType === 'meeting' && (
                  <>
                    <div className="form-group">
                      <label className="form-label">Judul Meeting *</label>
                      <input className="form-input" value={form.title} onChange={e => setForm({...form, title: e.target.value})} required />
                    </div>
                    <div className="form-row">
                      <div className="form-group">
                        <label className="form-label">Tanggal & Waktu *</label>
                        <input type="datetime-local" className="form-input" value={form.meeting_date} onChange={e => setForm({...form, meeting_date: e.target.value})} required />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Tipe</label>
                        <select className="form-input" value={form.meeting_type} onChange={e => setForm({...form, meeting_type: e.target.value})}>
                          <option value="offline">Offline</option>
                          <option value="online">Online</option>
                        </select>
                      </div>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Lokasi / Link</label>
                      <input className="form-input" value={form.location} onChange={e => setForm({...form, location: e.target.value})} />
                    </div>
                  </>
                )}

          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={handleCloseModal}>Batal</button>
            <button type="submit" className="btn btn-primary">Simpan</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
