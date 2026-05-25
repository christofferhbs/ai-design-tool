import React from 'react';
import projects from '../projects.json';

const DC = {
  bg: '#f0eee9',
  grid: 'rgba(0,0,0,0.06)',
  label: 'rgba(60,50,40,0.7)',
  title: 'rgba(40,30,20,0.85)',
  subtitle: 'rgba(60,50,40,0.6)',
  font: '-apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif',
};

const gridSvg = `url("data:image/svg+xml,%3Csvg width='120' height='120' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M120 0H0v120' fill='none' stroke='${encodeURIComponent(DC.grid)}' stroke-width='1'/%3E%3C/svg%3E")`;

const CARD_W = 400;
const CARD_H = Math.round(CARD_W * 9 / 16);
// The iframe renders the project at full viewport size, then we scale it
// down to fit the card. Wider than the card so cards show a content area
// proportional to a real desktop view.
const FRAME_W = 1280;
const FRAME_H = Math.round(FRAME_W * CARD_H / CARD_W);
const FRAME_SCALE = CARD_W / FRAME_W;

function ProjectCard({ project }) {
  const [hovered, setHovered] = React.useState(false);
  const base = import.meta.env.BASE_URL;
  const projectUrl = base + project.urlPath;

  return (
    <div style={{ flexShrink: 0 }}>
      <div style={{ marginBottom: 8, fontSize: 15, fontWeight: 500, color: DC.label }}>
        {project.name}
      </div>
      <a
        href={projectUrl}
        style={{
          position: 'relative',
          display: 'block',
          width: CARD_W, height: CARD_H,
          background: '#fff',
          borderRadius: 2,
          boxShadow: hovered
            ? '0 1px 3px rgba(0,0,0,.10),0 8px 28px rgba(0,0,0,.13)'
            : '0 1px 3px rgba(0,0,0,.08),0 4px 16px rgba(0,0,0,.06)',
          overflow: 'hidden',
          textDecoration: 'none',
          transition: 'box-shadow .15s',
        }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <iframe
          src={projectUrl + '?preview=1'}
          title={project.name}
          loading="lazy"
          tabIndex={-1}
          style={{
            width: FRAME_W, height: FRAME_H,
            border: 0,
            transform: `scale(${FRAME_SCALE})`,
            transformOrigin: 'top left',
            pointerEvents: 'none',
            display: 'block',
          }}
        />
      </a>
      {project.description && (
        <div style={{ marginTop: 8, fontSize: 12, color: DC.subtitle, maxWidth: CARD_W }}>
          {project.description}
        </div>
      )}
    </div>
  );
}

export default function ProjectsPage() {
  return (
    <div style={{
      minHeight: '100vh',
      background: DC.bg,
      backgroundImage: gridSvg,
      backgroundSize: '120px 120px',
      fontFamily: DC.font,
      padding: '60px',
      boxSizing: 'border-box',
    }}>
      <div style={{ marginBottom: 36 }}>
        <div style={{ fontSize: 28, fontWeight: 600, color: DC.title, letterSpacing: -0.4, marginBottom: 6 }}>
          Design Projects
        </div>
      </div>
      <div style={{ display: 'flex', gap: 48, alignItems: 'flex-start', flexWrap: 'wrap' }}>
        {projects.map(p => <ProjectCard key={p.id} project={p} />)}
      </div>
    </div>
  );
}
