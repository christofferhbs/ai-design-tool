import React from 'react';
import { DC } from './tokens.js';

// Shared header + focus-view UI for both the DesignCanvas and the
// PresentationCanvas: the top project header, the focus-view bar,
// prev/next arrows, dot indicator, and the small icon set they all use.

if (typeof document !== 'undefined' && !document.getElementById('dt-nav-styles')) {
  const s = document.createElement('style');
  s.id = 'dt-nav-styles';
  s.textContent = [
    '.dt-card:focus-visible{outline:2px solid rgba(201,100,66,.95);outline-offset:4px}',
    '.dt-icon-button:focus-visible,.dt-nav-arrow:focus-visible,.dt-dot:focus-visible,.dt-header-link:focus-visible',
    '  {outline:2px solid rgba(201,100,66,.95);outline-offset:3px}',
  ].join('\n');
  document.head.appendChild(s);
}

export function ProjectHeader({ title, children }) {
  return (
    <header
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 20,
        height: 64,
        display: 'flex',
        alignItems: 'center',
        gap: 18,
        padding: '0 40px',
        boxSizing: 'border-box',
        background: 'rgba(240,238,233,.82)',
        WebkitBackdropFilter: 'blur(18px) saturate(140%)',
        backdropFilter: 'blur(18px) saturate(140%)',
        borderBottom: '1px solid rgba(60,50,40,.09)',
        fontFamily: DC.font,
      }}
    >
      <a
        href={import.meta.env.BASE_URL}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          color: DC.label,
          textDecoration: 'none',
          fontSize: 13,
          fontWeight: 600,
        }}
      >
        <ArrowLeftIcon size={13} />
        Projects
      </a>
      <HeaderDivider />
      <div
        style={{
          fontSize: 17,
          fontWeight: 650,
          color: DC.title,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}
      >
        {title}
      </div>
      {children}
    </header>
  );
}

export function HeaderDivider() {
  return <div style={{ width: 1, height: 18, background: 'rgba(60,50,40,.16)', flex: '0 0 auto' }} />;
}

export function HeaderNav({ items, onSelect }) {
  if (!items?.length) return null;
  return (
    <nav style={{ display: 'flex', gap: 2, minWidth: 0, overflow: 'hidden' }}>
      {items.map((item) => (
        <button
          key={item.id}
          type="button"
          className="dt-header-link"
          onClick={() => onSelect(item.id)}
          style={{
            border: 0,
            background: 'transparent',
            cursor: 'pointer',
            padding: '7px 11px',
            borderRadius: 6,
            fontFamily: DC.font,
            fontSize: 13,
            fontWeight: 500,
            lineHeight: 1.2,
            color: DC.label,
            transition: 'background .12s, color .12s',
            whiteSpace: 'nowrap',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(0,0,0,.05)';
            e.currentTarget.style.color = DC.title;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.color = DC.label;
          }}
        >
          {item.label}
        </button>
      ))}
    </nav>
  );
}

export function FocusHeader({ sectionTitle, label, onClose }) {
  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 64,
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        padding: '0 20px',
        boxSizing: 'border-box',
        background: 'rgba(250,249,247,.9)',
        borderBottom: '1px solid rgba(60,50,40,.08)',
        fontFamily: DC.font,
      }}
    >
      <button
        type="button"
        className="dt-icon-button"
        onClick={onClose}
        aria-label="Back to all artboards"
        title="Back to all artboards"
        style={iconButtonStyle}
      >
        <ArrowLeftIcon size={16} />
      </button>
      <div style={{ minWidth: 0 }}>
        <div
          style={{
            fontSize: 16,
            lineHeight: 1.2,
            fontWeight: 650,
            color: DC.title,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {sectionTitle}
        </div>
        <div
          style={{
            marginTop: 2,
            fontSize: 12,
            lineHeight: 1.2,
            fontWeight: 500,
            color: DC.subtitle,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {label}
        </div>
      </div>
      <div style={{ flex: 1 }} />
      <button
        type="button"
        className="dt-icon-button"
        onClick={onClose}
        aria-label="Close focus view"
        title="Close"
        style={iconButtonStyle}
      >
        <CloseIcon />
      </button>
    </div>
  );
}

export function FocusArrow({ dir, onClick, offset = -72 }) {
  return (
    <button
      type="button"
      className="dt-nav-arrow"
      onClick={onClick}
      aria-label={dir === 'left' ? 'Previous artboard' : 'Next artboard'}
      title={dir === 'left' ? 'Previous artboard' : 'Next artboard'}
      style={{
        position: 'absolute',
        top: '50%',
        [dir]: offset,
        transform: 'translateY(-50%)',
        width: 44,
        height: 44,
        border: 0,
        borderRadius: 22,
        padding: 0,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(40,30,20,.07)',
        color: DC.title,
        cursor: 'pointer',
        transition: 'background .15s',
      }}
      onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(40,30,20,.14)')}
      onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(40,30,20,.07)')}
    >
      <ChevronIcon dir={dir} />
    </button>
  );
}

export function FocusDots({ items, activeIdx, onSelect }) {
  return (
    <div
      style={{
        position: 'absolute',
        left: 20,
        right: 20,
        bottom: 18,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
      }}
    >
      {items.map((item, idx) => (
        <button
          key={item.id}
          type="button"
          className="dt-dot"
          aria-label={item.label}
          onClick={() => onSelect(idx)}
          style={{
            width: idx === activeIdx ? 18 : 7,
            height: 7,
            borderRadius: 999,
            border: 0,
            padding: 0,
            background: idx === activeIdx ? 'rgba(40,30,20,.82)' : 'rgba(40,30,20,.24)',
            cursor: 'pointer',
            transition: 'width .15s, background .15s',
          }}
        />
      ))}
    </div>
  );
}

const iconButtonStyle = {
  width: 36,
  height: 36,
  border: 0,
  borderRadius: 6,
  padding: 0,
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: 'transparent',
  color: DC.label,
  cursor: 'pointer',
};

export function ArrowLeftIcon({ size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M8.5 3L4.5 7l4 4" />
      <path d="M5 7h6" />
    </svg>
  );
}

export function CloseIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
      <path d="M3 3l8 8M11 3l-8 8" />
    </svg>
  );
}

export function ChevronIcon({ dir }) {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={dir === 'left' ? 'M11 3L5 9l6 6' : 'M7 3l6 6-6 6'} />
    </svg>
  );
}
