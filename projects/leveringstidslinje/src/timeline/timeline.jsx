// timeline.jsx — horizontal timeline with stations and "i dag" marker.
// Pure presentation: feed it stations + a 0..1 todayFrac for marker position.

import React from 'react';
import { fmtShort } from '../data/format.js';

export function Timeline({ stations, todayFrac, today }) {
  // Layout (top → bottom):
  //   y=0..14    "i dag" small label
  //   y=14..38   today date pill
  //   y=44..60   station-date row (small labels above the dashed line)
  //   y=64       dashed track
  //   y=64..78   vertical tick (extends DOWN from the dashed line)
  //   y=82+      circles, then title, then subtitle
  return (
    <div style={{ position: 'relative', marginTop: 24, paddingTop: 64 }}>
      {/* Dashed track — above the circles, not through them */}
      <div style={{
        position: 'absolute',
        top: 64,
        left: `calc(${100 / (stations.length * 2)}%)`,
        right: `calc(${100 / (stations.length * 2)}%)`,
        borderTop: '1.5px dashed var(--rich)',
        opacity: 0.6,
      }} />

      <div style={{
        position: 'absolute',
        top: 44, left: 0, right: 0,
        display: 'grid',
        gridTemplateColumns: `repeat(${stations.length}, 1fr)`,
        height: 16,
        pointerEvents: 'none',
      }}>
        {stations.map((s, i) => (
          <div key={i} style={{
            textAlign: 'center',
            font: '500 12px/1.3 "Montserrat", sans-serif',
            color: 'var(--accent)',
            letterSpacing: '0.02em',
            whiteSpace: 'nowrap',
          }}>
            {s.date}
          </div>
        ))}
      </div>

      <TodayMarker frac={todayFrac} today={today} stations={stations} />

      <div style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${stations.length}, 1fr)`,
        position: 'relative',
      }}>
        {stations.map((s, i) => {
          const stationFrac = i / (stations.length - 1);
          const reached = todayFrac >= stationFrac - 0.001;
          return <Step key={i} index={i + 1} reached={reached} {...s} />;
        })}
      </div>
    </div>
  );
}

function Step({ index, title, subtitle, icon, accent, reached }) {
  const ringColor = accent === 'warn' ? 'var(--card-warn-bg)' : 'var(--rich)';
  const iconColor = accent === 'warn' ? 'var(--card-warn-fg)' : 'var(--paper)';
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      position: 'relative',
    }}>
      {/* Milestone tick — extends DOWN from the dashed line into the circle area */}
      <div style={{
        width: 3,
        height: 14,
        background: reached ? 'var(--today)' : 'var(--rich)',
        opacity: reached ? 1 : 0.35,
        borderRadius: 1.5,
        marginBottom: 8,
      }} />
      <div style={{
        width: 92, height: 92, borderRadius: '50%',
        background: ringColor,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        position: 'relative',
      }}>
        <StationIcon kind={icon} color={iconColor} size={48} />
        <div style={{
          position: 'absolute', bottom: -6, right: -6,
          width: 26, height: 26, borderRadius: '50%',
          background: 'var(--ink)', color: 'var(--paper)',
          font: '600 12px/1 "Montserrat", sans-serif',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          {index}
        </div>
      </div>
      <div style={{
        font: '400 17px/1.25 "DM Serif Display", serif',
        color: 'var(--ink)',
        textAlign: 'center',
        maxWidth: 220,
        marginTop: 16,
      }}>
        {title}
      </div>
      {subtitle && (
        <div style={{
          font: '400 13px/1.45 "Work Sans", sans-serif',
          color: 'var(--ink-soft)',
          textAlign: 'center',
          maxWidth: 220,
          marginTop: 6,
          textWrap: 'pretty',
        }}>
          {subtitle}
        </div>
      )}
    </div>
  );
}

function TodayMarker({ frac, today, stations }) {
  // Track range: first circle center → last circle center, as percentages
  // of the container width. Mirrors the dashed track edges.
  const edge = 100 / (stations.length * 2);
  const left = `calc(${edge}% + ${frac} * (100% - ${edge * 2}%))`;
  return (
    <div style={{
      position: 'absolute',
      top: 0,
      left,
      transform: 'translateX(-50%)',
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      pointerEvents: 'none',
      transition: 'left 0.25s ease',
    }}>
      <div style={{
        font: '600 10px/1 "Montserrat", sans-serif',
        color: 'var(--today)',
        letterSpacing: '0.1em',
        textTransform: 'uppercase',
        opacity: 0.78,
        marginBottom: 4,
      }}>
        I dag
      </div>
      <div style={{
        background: 'var(--today)',
        color: 'var(--paper)',
        font: '500 12px/1 "Work Sans", sans-serif',
        padding: '6px 10px',
        borderRadius: 'var(--radius-pill)',
        whiteSpace: 'nowrap',
        boxShadow: '0 2px 6px rgba(0,0,0,0.12)',
      }}>
        {fmtShort(today)}
      </div>
      {/* Spacer clears the station-date row (y=44..60) so the dot lands on the dashed line at y=64 */}
      <div style={{ height: 22 }} />
      <div style={{
        width: 8, height: 8, borderRadius: '50%',
        background: 'var(--today)',
      }} />
    </div>
  );
}

function StationIcon({ kind, color = 'currentColor', size = 32 }) {
  const props = {
    width: size, height: size, viewBox: '0 0 32 32',
    fill: 'none', stroke: color, strokeWidth: 1.8,
    strokeLinecap: 'round', strokeLinejoin: 'round',
  };
  if (kind === 'basket') return (
    <svg {...props}>
      <path d="M 6 12 L 26 12 L 23 24 L 9 24 Z" />
      <path d="M 10 12 Q 10 5, 16 5 Q 22 5, 22 12" />
      <path d="M 13 16 L 13 20" opacity={0.6} />
      <path d="M 16 16 L 16 20" opacity={0.6} />
      <path d="M 19 16 L 19 20" opacity={0.6} />
    </svg>
  );
  if (kind === 'lock') return (
    <svg {...props}>
      <rect x={7} y={14} width={18} height={13} rx={1.5} />
      <path d="M 11 14 L 11 10 Q 11 5, 16 5 Q 21 5, 21 10 L 21 14" />
      <circle cx={16} cy={19.5} r={1.5} fill={color} stroke="none" />
      <path d="M 16 21 L 16 23.5" />
    </svg>
  );
  if (kind === 'mail') return (
    <svg {...props}>
      <rect x={5} y={9} width={22} height={15} rx={1.5} />
      <path d="M 5 11 L 16 18 L 27 11" />
    </svg>
  );
  if (kind === 'house') return (
    <svg {...props}>
      <path d="M 5 15 L 16 6 L 27 15" />
      <path d="M 7 14 L 7 26 L 25 26 L 25 14" />
      <path d="M 13 26 L 13 18 L 19 18 L 19 26" />
    </svg>
  );
  return null;
}
