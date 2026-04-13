import { format, formatDistanceToNow, differenceInHours, isPast } from 'date-fns';
import { id } from 'date-fns/locale';

// Format currency to Indonesian Rupiah
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount || 0);
};

// Short currency format (e.g., 250 Juta)
export const formatCurrencyShort = (amount) => {
  if (!amount) return 'Rp 0';
  if (amount >= 1000000000) return `Rp ${(amount / 1000000000).toFixed(1)} M`;
  if (amount >= 1000000) return `Rp ${(amount / 1000000).toFixed(0)} Jt`;
  if (amount >= 1000) return `Rp ${(amount / 1000).toFixed(0)} Rb`;
  return `Rp ${amount}`;
};

// Format date
export const formatDate = (date) => {
  if (!date) return '-';
  return format(new Date(date), 'dd MMM yyyy', { locale: id });
};

// Format date with time
export const formatDateTime = (date) => {
  if (!date) return '-';
  return format(new Date(date), 'dd MMM yyyy, HH:mm', { locale: id });
};

// Format time only
export const formatTime = (time) => {
  if (!time) return '-';
  return time.substring(0, 5);
};

// Relative time (e.g., "2 jam lagi")
export const formatRelative = (date) => {
  if (!date) return '-';
  return formatDistanceToNow(new Date(date), { addSuffix: true, locale: id });
};

// Get deadline urgency level
export const getDeadlineUrgency = (dueDate, status) => {
  if (status === 'completed') return 'completed';
  const now = new Date();
  const due = new Date(dueDate);
  if (isPast(due)) return 'overdue';
  const hours = differenceInHours(due, now);
  if (hours <= 24) return 'overdue';
  if (hours <= 48) return 'urgent';
  if (hours <= 168) return 'soon';
  return 'ontrack';
};

// Get deadline time label
export const getDeadlineTimeLabel = (dueDate, status) => {
  if (status === 'completed') return 'Selesai';
  const now = new Date();
  const due = new Date(dueDate);
  if (isPast(due)) return 'Terlambat!';
  const hours = differenceInHours(due, now);
  if (hours < 1) return 'Kurang dari 1 jam';
  if (hours <= 24) return `${hours} jam lagi`;
  if (hours <= 48) return `${Math.round(hours / 24)} hari lagi`;
  const days = Math.round(hours / 24);
  return `${days} hari lagi`;
};

// Status labels in Indonesian
export const statusLabels = {
  planning: 'Perencanaan',
  in_progress: 'Berlangsung',
  completed: 'Selesai',
  cancelled: 'Dibatalkan',
  pending: 'Menunggu',
  dp_paid: 'DP Dibayar',
  partial: 'Sebagian',
  paid: 'Lunas',
  overdue: 'Terlambat',
  in_progress: 'Berlangsung',
  scheduled: 'Terjadwal',
  rescheduled: 'Dijadwalkan Ulang',
};

// Status badge class
export const statusBadgeClass = (status) => {
  const map = {
    planning: 'badge-info',
    in_progress: 'badge-warning',
    completed: 'badge-success',
    cancelled: 'badge-danger',
    pending: 'badge-warning',
    dp_paid: 'badge-info',
    partial: 'badge-purple',
    paid: 'badge-success',
    overdue: 'badge-danger',
    scheduled: 'badge-info',
    rescheduled: 'badge-warning',
    low: 'badge-muted',
    medium: 'badge-info',
    high: 'badge-warning',
    urgent: 'badge-danger',
  };
  return map[status] || 'badge-muted';
};

// Event type labels
export const eventTypeLabels = {
  wedding: 'Pernikahan',
  corporate: 'Korporat',
  birthday: 'Ulang Tahun',
  other: 'Lainnya',
};

// Vendor category labels
export const vendorCategoryLabels = {
  catering: 'Catering',
  dekorasi: 'Dekorasi',
  fotografer: 'Fotografer',
  mc: 'MC',
  musik: 'Musik',
  makeup: 'Makeup',
  transport: 'Transportasi',
  venue: 'Venue',
  lainnya: 'Lainnya',
};

// Priority labels
export const priorityLabels = {
  low: 'Rendah',
  medium: 'Sedang',
  high: 'Tinggi',
  urgent: 'Mendesak',
};

// Payment type labels
export const paymentTypeLabels = {
  dp: 'Down Payment',
  installment: 'Cicilan',
  full: 'Pelunasan',
  refund: 'Refund',
};
