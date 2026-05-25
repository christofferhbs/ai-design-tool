// delivery-card.jsx — month + deadline card shown above each timeline.
// Two-section card: green/horizon top with month, yellow bottom with deadline.

import React from 'react';

export function DeliveryCard({ eyebrow, bigDate, deadlineEyebrow, deadline, variant = 'primary' }) {
  const topBg = variant === 'horizon' ? 'var(--card-bg-horizon)' : 'var(--card-bg)';
  return (
    <div style={{
      borderRadius: 8,
      overflow: 'hidden',
      display: 'flex', flexDirection: 'column',
      boxShadow: '0 4px 14px rgba(0,0,0,0.10)',
      minHeight: 232,
    }}>
      <div style={{
        background: topBg,
        color: 'var(--card-fg)',
        textAlign: 'center',
        padding: '34px 24px 30px',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20,
        flex: 1,
      }}>
        <div style={{
          font: '700 12px/1.4 "Montserrat", sans-serif',
          letterSpacing: '0.12em',
        }}>
          {eyebrow}
        </div>
        <div style={{
          font: '400 36px/1.05 "DM Serif Display", serif',
        }}>
          {bigDate}
        </div>
      </div>

      <div style={{
        background: 'var(--card-warn-bg)',
        color: 'var(--card-warn-fg)',
        textAlign: 'center',
        padding: '16px 24px 20px',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
      }}>
        <div style={{
          font: '700 11px/1.4 "Montserrat", sans-serif',
          letterSpacing: '0.12em',
          opacity: 0.78,
        }}>
          {deadlineEyebrow}
        </div>
        <div style={{
          font: '400 16px/1.4 "Work Sans", sans-serif',
        }}>
          {deadline}
        </div>
      </div>
    </div>
  );
}
