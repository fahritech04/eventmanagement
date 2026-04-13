import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { formatCurrency, formatCurrencyShort, formatDateTime, formatRelative, getDeadlineUrgency, getDeadlineTimeLabel, statusLabels, statusBadgeClass, priorityLabels } from '../services/helpers';
import { Calendar, Clock, CreditCard, MessageSquare, TrendingUp, AlertTriangle, CheckCircle, ArrowRight } from 'lucide-react';
import { PieChart, Pie, Cell, AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const CHART_COLORS = ['#3b82f6', '#f59e0b', '#22c55e', '#ef4444', '#8b5cf6'];

export default function DashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const res = await api.get('/api/dashboard/stats');
      setData(res.data);
    } catch (err) {
      console.error('Failed to fetch dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading-spinner"><div className="spinner" /></div>;
  }

  if (!data) {
    return <div className="empty-state"><h3>Gagal memuat dashboard</h3></div>;
  }

  const { stats, upcomingDeadlines, upcomingMeetings, recentPayments, monthlyRevenue, eventsByStatus } = data;

  const pieData = eventsByStatus?.map(e => ({
    name: statusLabels[e.status] || e.status,
    value: parseInt(e.count),
    status: e.status,
  })) || [];

  const statusColorMap = { planning: '#3b82f6', in_progress: '#f59e0b', completed: '#22c55e', cancelled: '#ef4444' };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Ringkasan aktivitas event organizer Anda</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-card-label">Total Event Aktif</span>
            <div className="stat-card-icon purple"><Calendar size={20} /></div>
          </div>
          <div className="stat-card-value">{parseInt(stats.events?.in_progress || 0) + parseInt(stats.events?.planning || 0)}</div>
          <div className="stat-card-change positive">
            {stats.events?.completed || 0} selesai · {stats.events?.total || 0} total
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-card-label">Deadline Menunggu</span>
            <div className="stat-card-icon red"><Clock size={20} /></div>
          </div>
          <div className="stat-card-value">{parseInt(stats.deadlines?.pending || 0) + parseInt(stats.deadlines?.in_progress || 0)}</div>
          <div className="stat-card-change negative">
            <AlertTriangle size={12} />
            {stats.deadlines?.urgent || 0} mendesak
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-card-label">Revenue Bulan Ini</span>
            <div className="stat-card-icon green"><TrendingUp size={20} /></div>
          </div>
          <div className="stat-card-value">{formatCurrencyShort(parseFloat(stats.revenue?.paid_this_month || 0))}</div>
          <div className="stat-card-change">
            <CreditCard size={12} style={{ color: 'var(--text-tertiary)' }} />
            <span style={{ color: 'var(--warning)' }}>{formatCurrencyShort(parseFloat(stats.revenue?.pending_amount || 0))} pending</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-card-label">Meeting Hari Ini</span>
            <div className="stat-card-icon blue"><MessageSquare size={20} /></div>
          </div>
          <div className="stat-card-value">{stats.meetingsToday || 0}</div>
          <div className="stat-card-change positive">
            <CheckCircle size={12} />
            {stats.deadlines?.completed || 0} deadline selesai
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid-2" style={{ marginBottom: 20 }}>
        {/* Event Status Pie Chart */}
        <div className="card">
          <div className="chart-header">
            <h3 className="chart-title">Status Event</h3>
          </div>
          <div className="chart-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 32 }}>
            <ResponsiveContainer width={180} height={180}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                  stroke="none"
                >
                  {pieData.map((entry, i) => (
                    <Cell key={i} fill={statusColorMap[entry.status] || CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div>
              {pieData.map((entry, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: statusColorMap[entry.status] || CHART_COLORS[i] }} />
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', minWidth: 80 }}>{entry.name}</span>
                  <span style={{ fontSize: '0.9rem', fontWeight: 700, fontFamily: 'Outfit' }}>{entry.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Revenue Area Chart */}
        <div className="card">
          <div className="chart-header">
            <h3 className="chart-title">Revenue Bulanan</h3>
          </div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={monthlyRevenue || []} margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="month_label" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => formatCurrencyShort(v)} width={70} />
                <Tooltip
                  contentStyle={{ background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, fontSize: 13 }}
                  formatter={(value) => [formatCurrency(value), 'Revenue']}
                  labelStyle={{ color: '#94a3b8' }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#8b5cf6" strokeWidth={2} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Deadlines + Meetings Row */}
      <div className="grid-2-1" style={{ marginBottom: 20 }}>
        {/* Upcoming Deadlines */}
        <div className="card">
          <div className="chart-header">
            <h3 className="chart-title">Deadline Mendatang</h3>
            <button className="btn btn-secondary btn-sm" onClick={() => navigate('/deadlines')}>
              Lihat Semua <ArrowRight size={14} />
            </button>
          </div>
          <div className="deadline-list">
            {upcomingDeadlines?.length > 0 ? upcomingDeadlines.slice(0, 6).map((d) => {
              const urgency = getDeadlineUrgency(d.due_date, d.status);
              return (
                <div key={d.id} className={`deadline-item ${urgency}`}>
                  <div className={`deadline-indicator deadline-${urgency}`}>
                    <div className="deadline-dot" />
                  </div>
                  <div className="deadline-item-content">
                    <div className="deadline-item-title">{d.title}</div>
                    <div className="deadline-item-event">{d.event_title} · {d.assigned_to || '-'}</div>
                  </div>
                  <div className="deadline-item-time" style={{
                    color: urgency === 'overdue' ? 'var(--danger)' : urgency === 'urgent' ? 'var(--warning)' : 'var(--text-secondary)'
                  }}>
                    {getDeadlineTimeLabel(d.due_date, d.status)}
                  </div>
                </div>
              );
            }) : (
              <div className="empty-state" style={{ padding: 24 }}>
                <CheckCircle size={32} />
                <h3>Semua deadline aman!</h3>
                <p>Tidak ada deadline dalam 7 hari ke depan</p>
              </div>
            )}
          </div>
        </div>

        {/* Upcoming Meetings */}
        <div className="card">
          <div className="chart-header">
            <h3 className="chart-title">Meeting Mendatang</h3>
          </div>
          {upcomingMeetings?.length > 0 ? upcomingMeetings.map((m) => (
            <div key={m.id} style={{
              padding: '12px 0',
              borderBottom: '1px solid var(--border-color)',
              display: 'flex',
              flexDirection: 'column',
              gap: 4,
            }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>{m.title}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center', gap: 4 }}>
                <Calendar size={12} /> {formatDateTime(m.meeting_date)}
              </div>
              {m.event_title && (
                <div style={{ fontSize: '0.72rem', color: 'var(--accent-secondary)' }}>{m.event_title}</div>
              )}
            </div>
          )) : (
            <div className="empty-state" style={{ padding: 24 }}>
              <MessageSquare size={32} />
              <p>Belum ada meeting terjadwal</p>
            </div>
          )}
        </div>
      </div>

      {/* Recent Payments */}
      <div className="card">
        <div className="chart-header">
          <h3 className="chart-title">Pembayaran Terakhir</h3>
          <button className="btn btn-secondary btn-sm" onClick={() => navigate('/payments')}>
            Lihat Semua <ArrowRight size={14} />
          </button>
        </div>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Event</th>
                <th>Vendor</th>
                <th>Jumlah</th>
                <th>Tipe</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {recentPayments?.map((p) => (
                <tr key={p.id}>
                  <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{p.event_title}</td>
                  <td>{p.vendor_name || '-'}</td>
                  <td style={{ fontFamily: 'Outfit', fontWeight: 600 }}>{formatCurrency(p.amount)}</td>
                  <td><span className="badge badge-muted">{p.payment_type?.toUpperCase()}</span></td>
                  <td><span className={`badge ${statusBadgeClass(p.status)}`}>{statusLabels[p.status] || p.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
