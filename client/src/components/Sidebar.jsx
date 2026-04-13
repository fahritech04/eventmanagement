import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard, Calendar, Users, Clock, CreditCard,
  MessageSquare, Settings, LogOut, Sparkles
} from 'lucide-react';

const navItems = [
  { section: 'Menu Utama' },
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/events', label: 'Event', icon: Calendar },
  { path: '/vendors', label: 'Vendor', icon: Users },
  { section: 'Tracking' },
  { path: '/deadlines', label: 'Deadline', icon: Clock },
  { path: '/payments', label: 'Pembayaran', icon: CreditCard },
  { path: '/meetings', label: 'Meeting', icon: MessageSquare },
  { section: 'Pengaturan' },
  { path: '/webhooks', label: 'Webhook', icon: Settings },
];

export default function Sidebar() {
  const { user, tenant, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getInitials = (name) => {
    return name?.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || '?';
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">
            <Sparkles size={22} />
          </div>
          <div className="sidebar-logo-text">
            <h1>EventPro</h1>
            <p>{tenant?.name || 'Dashboard'}</p>
          </div>
        </div>
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item, i) =>
          item.section ? (
            <div key={i} className="sidebar-section-label">{item.section}</div>
          ) : (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}
            >
              <item.icon size={20} />
              <span>{item.label}</span>
            </NavLink>
          )
        )}
      </nav>

      <div className="sidebar-user">
        <div className="sidebar-avatar">{getInitials(user?.name)}</div>
        <div className="sidebar-user-info">
          <div className="sidebar-user-name">{user?.name}</div>
          <div className="sidebar-user-role">{user?.role === 'owner' ? 'Pemilik' : user?.role === 'admin' ? 'Admin' : 'Anggota'}</div>
        </div>
        <button className="sidebar-logout-btn" onClick={handleLogout} title="Keluar">
          <LogOut size={18} />
        </button>
      </div>
    </aside>
  );
}
