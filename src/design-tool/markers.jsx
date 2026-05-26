import React from 'react';

// Recursively unwrap React.Fragment so <>...</> grouping doesn't hide
// DCSection/DCArtboard children from the type-based walks in each shell.
export function dcFlatten(children) {
  const out = [];
  React.Children.forEach(children, (c) => {
    if (c && c.type === React.Fragment) out.push(...dcFlatten(c.props.children));
    else out.push(c);
  });
  return out;
}

// Marker components: PresentationCanvas reads these elements directly;
// DesignCanvas converts them into editable canvas frames in dev mode.
export function DCSection() { return null; }
export function DCArtboard() { return null; }
