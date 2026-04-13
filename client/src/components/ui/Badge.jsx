import { statusLabels, statusBadgeClass } from '../../services/helpers';

export default function Badge({ status, label, type = 'status' }) {
  if (type === 'status') {
    return (
      <span className={`badge ${statusBadgeClass(status)}`}>
        {statusLabels[status] || status}
      </span>
    );
  }

  // Type generic
  return (
    <span className={`badge badge-${status}`}>
      {label || status}
    </span>
  );
}
