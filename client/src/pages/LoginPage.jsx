import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Sparkles, Mail, Lock, User, Building, Hash, Phone } from 'lucide-react';

export default function LoginPage() {
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const [isRegister, setIsRegister] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    email: '',
    password: '',
    name: '',
    tenantName: '',
    tenantSlug: '',
    phone: '',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isRegister) {
        await register(form);
      } else {
        await login(form.email, form.password);
      }
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Terjadi kesalahan. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));

    // Auto-generate slug from tenant name
    if (name === 'tenantName') {
      setForm(prev => ({
        ...prev,
        [name]: value,
        tenantSlug: value.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-'),
      }));
    }
  };

  return (
    <div className="login-container">
      <div className="login-bg-glow login-bg-glow-1" />
      <div className="login-bg-glow login-bg-glow-2" />

      <div className="login-card">
        <div className="login-logo">
          <div className="login-logo-icon">
            <Sparkles size={26} />
          </div>
          <h2>EventPro</h2>
        </div>

        <div className="login-title">
          <h3>{isRegister ? 'Daftar Akun Baru' : 'Selamat Datang Kembali'}</h3>
          <p>{isRegister ? 'Buat organisasi dan mulai kelola event Anda' : 'Masuk ke dashboard event organizer Anda'}</p>
        </div>

        {error && <div className="login-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          {isRegister && (
            <>
              <div className="form-group">
                <label className="form-label">Nama Organisasi</label>
                <div style={{ position: 'relative' }}>
                  <Building size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input
                    type="text"
                    name="tenantName"
                    className="form-input"
                    style={{ paddingLeft: 36 }}
                    placeholder="Rose Wedding Organizer"
                    value={form.tenantName}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Slug (URL identifier)</label>
                <div style={{ position: 'relative' }}>
                  <Hash size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input
                    type="text"
                    name="tenantSlug"
                    className="form-input"
                    style={{ paddingLeft: 36 }}
                    placeholder="rose-wo"
                    value={form.tenantSlug}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Nama Lengkap</label>
                <div style={{ position: 'relative' }}>
                  <User size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input
                    type="text"
                    name="name"
                    className="form-input"
                    style={{ paddingLeft: 36 }}
                    placeholder="Sari Dewi"
                    value={form.name}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
            </>
          )}

          <div className="form-group">
            <label className="form-label">Email</label>
            <div style={{ position: 'relative' }}>
              <Mail size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="email"
                name="email"
                className="form-input"
                style={{ paddingLeft: 36 }}
                placeholder="admin@rosewedding.id"
                value={form.email}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="password"
                name="password"
                className="form-input"
                style={{ paddingLeft: 36 }}
                placeholder="••••••••"
                value={form.password}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary login-btn" disabled={loading}>
            {loading ? 'Memproses...' : isRegister ? 'Daftar Sekarang' : 'Masuk'}
          </button>
        </form>

        <div className="login-switch">
          {isRegister ? (
            <>Sudah punya akun? <a href="#" onClick={(e) => { e.preventDefault(); setIsRegister(false); setError(''); }}>Masuk di sini</a></>
          ) : (
            <>Belum punya akun? <a href="#" onClick={(e) => { e.preventDefault(); setIsRegister(true); setError(''); }}>Daftar sekarang</a></>
          )}
        </div>
      </div>
    </div>
  );
}
