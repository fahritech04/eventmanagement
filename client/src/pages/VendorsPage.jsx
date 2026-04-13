import { useState, useEffect } from 'react';
import api from '../services/api';
import { vendorCategoryLabels } from '../services/helpers';
import { Plus, Search, Star, X, Users } from 'lucide-react';
import Modal from '../components/ui/Modal';
import EmptyState from '../components/ui/EmptyState';
import Badge from '../components/ui/Badge';

export default function VendorsPage() {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editVendor, setEditVendor] = useState(null);

  const emptyForm = { name: '', category: 'catering', contact_person: '', phone: '', email: '', address: '', description: '', rating: '' };
  const [form, setForm] = useState(emptyForm);

  useEffect(() => { fetchVendors(); }, [search, categoryFilter]);

  const fetchVendors = async () => {
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (categoryFilter) params.set('category', categoryFilter);
      const res = await api.get(`/api/vendors?${params}`);
      setVendors(res.data.vendors);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editVendor) {
        await api.put(`/api/vendors/${editVendor.id}`, form);
      } else {
        await api.post('/api/vendors', form);
      }
      setShowModal(false); setForm(emptyForm); setEditVendor(null); fetchVendors();
    } catch (err) { alert(err.response?.data?.error || 'Gagal menyimpan'); }
  };

  const openEdit = (v) => {
    setEditVendor(v);
    setForm({ name: v.name, category: v.category, contact_person: v.contact_person || '', phone: v.phone || '', email: v.email || '', address: v.address || '', description: v.description || '', rating: v.rating || '' });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Yakin hapus vendor ini?')) return;
    await api.delete(`/api/vendors/${id}`); fetchVendors();
  };

  const renderStars = (rating) => {
    const stars = [];
    const r = parseFloat(rating) || 0;
    for (let i = 1; i <= 5; i++) {
      stars.push(<Star key={i} size={14} className={i <= Math.round(r) ? 'star' : 'star empty'} fill={i <= Math.round(r) ? '#fbbf24' : 'none'} />);
    }
    return <div className="rating">{stars}<span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginLeft: 4 }}>{r.toFixed(1)}</span></div>;
  };

  if (loading) return <div className="loading-spinner"><div className="spinner" /></div>;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Vendor</h1>
          <p className="page-subtitle">Database vendor untuk event Anda</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setEditVendor(null); setForm(emptyForm); setShowModal(true); }}>
          <Plus size={18} /> Tambah Vendor
        </button>
      </div>

      <div className="toolbar">
        <div className="toolbar-left">
          <div className="search-input">
            <Search />
            <input className="form-input" placeholder="Cari vendor..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select className="form-input filter-select" value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}>
            <option value="">Semua Kategori</option>
            {Object.entries(vendorCategoryLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </div>
      </div>

      <div className="card">
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Nama Vendor</th>
                <th>Kategori</th>
                <th>Kontak</th>
                <th>Telepon</th>
                <th>Rating</th>
                <th>Event</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {vendors.map(v => (
                <tr key={v.id}>
                  <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                    <div>{v.name}</div>
                    {v.description && <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 2 }}>{v.description.substring(0, 50)}...</div>}
                  </td>
                  <td><Badge status={v.category} label={vendorCategoryLabels[v.category] || v.category} /></td>
                  <td>{v.contact_person || '-'}</td>
                  <td style={{ fontSize: '0.8rem' }}>{v.phone || '-'}</td>
                  <td>{renderStars(v.rating)}</td>
                  <td style={{ fontFamily: 'Outfit', fontWeight: 600 }}>{v.total_events || 0}</td>
                  <td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button className="btn btn-secondary btn-sm" onClick={() => openEdit(v)}>Edit</button>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(v.id)}>Hapus</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {vendors.length === 0 && (
            <EmptyState 
              icon={Users} 
              title="Belum ada vendor" 
              description="Klik 'Tambah Vendor' untuk mendaftarkan vendor baru" 
            />
          )}
        </div>
      </div>

      <Modal 
        isOpen={showModal} 
        onClose={() => setShowModal(false)} 
        title={editVendor ? 'Edit Vendor' : 'Tambah Vendor Baru'}
      >
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label">Nama Vendor *</label>
              <input className="form-input" value={form.name} onChange={e => setForm(p => ({...p, name: e.target.value}))} required />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Kategori *</label>
                <select className="form-input" value={form.category} onChange={e => setForm(p => ({...p, category: e.target.value}))}>
                  {Object.entries(vendorCategoryLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Rating (0-5)</label>
                <input type="number" step="0.1" min="0" max="5" className="form-input" value={form.rating} onChange={e => setForm(p => ({...p, rating: e.target.value}))} />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Kontak Person</label>
                <input className="form-input" value={form.contact_person} onChange={e => setForm(p => ({...p, contact_person: e.target.value}))} />
              </div>
              <div className="form-group">
                <label className="form-label">Telepon</label>
                <input className="form-input" value={form.phone} onChange={e => setForm(p => ({...p, phone: e.target.value}))} />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input type="email" className="form-input" value={form.email} onChange={e => setForm(p => ({...p, email: e.target.value}))} />
            </div>
            <div className="form-group">
              <label className="form-label">Deskripsi</label>
              <textarea className="form-input" value={form.description} onChange={e => setForm(p => ({...p, description: e.target.value}))} rows={2} />
            </div>
          </div>
          <div className="modal-footer">
            {editVendor && <button type="button" className="btn btn-danger btn-sm" onClick={() => { handleDelete(editVendor.id); setShowModal(false); }}>Hapus</button>}
            <div style={{ flex: 1 }} />
            <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Batal</button>
            <button type="submit" className="btn btn-primary">{editVendor ? 'Simpan' : 'Tambah Vendor'}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
