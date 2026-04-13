import React from 'react';

export default function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="empty-state" style={{ gridColumn: '1 / -1' }}>
      {Icon && <Icon size={48} />}
      <h3>{title}</h3>
      {description && <p>{description}</p>}
      {action && <div style={{ marginTop: 16 }}>{action}</div>}
    </div>
  );
}
