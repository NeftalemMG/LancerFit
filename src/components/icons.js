import React from 'react';
import Svg, { Path, Circle, Rect } from 'react-native-svg';

// ============================================================
// UI ICONS — monoline icons ported from the inline SVGs in the
// prototype. Each takes { size, color, strokeWidth }.
// ============================================================

const base = (color, sw) => ({
  fill: 'none',
  stroke: color,
  strokeWidth: sw,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
});

export function HomeIcon({ size = 23, color = 'currentColor', strokeWidth = 1.8 }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M4 11l8-7 8 7" {...base(color, strokeWidth)} />
      <Path d="M6 9.5V19a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V9.5" {...base(color, strokeWidth)} />
    </Svg>
  );
}

export function ChallengesIcon({ size = 23, color = 'currentColor', strokeWidth = 1.8 }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M5 7l4 4 6-7" {...base(color, strokeWidth)} />
      <Path d="M5 16l4 4 6-7" {...base(color, strokeWidth)} />
      <Path d="M14 7h6M14 17h6" {...base(color, strokeWidth)} />
    </Svg>
  );
}

export function RanksIcon({ size = 23, color = 'currentColor', strokeWidth = 1.8 }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M6 20v-6M12 20V8M18 20v-9" {...base(color, strokeWidth)} />
      <Path d="M3 20h18" {...base(color, strokeWidth)} />
    </Svg>
  );
}

export function ProfileIcon({ size = 23, color = 'currentColor', strokeWidth = 1.8 }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Circle cx={12} cy={8.5} r={4} {...base(color, strokeWidth)} />
      <Path d="M4.5 20c1.6-4.3 4.7-6.3 7.5-6.3s5.9 2 7.5 6.3" {...base(color, strokeWidth)} />
    </Svg>
  );
}

export function PlusIcon({ size = 26, color = '#241A05', strokeWidth = 2.6 }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M12 5v14M5 12h14" {...base(color, strokeWidth)} />
    </Svg>
  );
}

export function PinIcon({ size = 22, color = '#4A93D8', strokeWidth = 2 }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" {...base(color, strokeWidth)} />
      <Circle cx={12} cy={10} r={2.6} {...base(color, strokeWidth)} />
    </Svg>
  );
}

export function ScanIcon({ size = 22, color = '#fff', strokeWidth = 2.2 }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M4 7V5a1.5 1.5 0 0 1 1.5-1.5H8M16 3.5h2.5A1.5 1.5 0 0 1 20 5v2M20 16v2.5a1.5 1.5 0 0 1-1.5 1.5H16M8 20H5.5A1.5 1.5 0 0 1 4 18.5V16" {...base(color, strokeWidth)} />
      <Path d="M4 12h16" {...base(color, strokeWidth)} />
    </Svg>
  );
}

export function CheckIcon({ size = 22, color = '#fff', strokeWidth = 2.6 }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M4.5 12.5l5 5L20 6.5" {...base(color, strokeWidth)} />
    </Svg>
  );
}

export function ArrowRight({ size = 17, color = '#fff', strokeWidth = 2.4 }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M5 12h13M13 6l6 6-6 6" {...base(color, strokeWidth)} />
    </Svg>
  );
}

export function ChevronRight({ size = 15, color = '#6E84A4', strokeWidth = 2.4 }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M9 5l7 7-7 7" {...base(color, strokeWidth)} />
    </Svg>
  );
}

export function ChevronLeft({ size = 18, color = '#A8BBD4', strokeWidth = 2.4 }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M15 5l-7 7 7 7" {...base(color, strokeWidth)} />
    </Svg>
  );
}

export function FlameIcon({ size = 15, color = '#D8A94A' }) {
  return (
    <Svg width={size} height={size * 1.13} viewBox="0 0 16 20">
      <Path d="M8.5 1C9 5 13.5 7 13.5 12a5.5 5.5 0 0 1-11 0C2.5 9 4.5 7.4 5.5 5c.7 1.4 1.6 2.2 2.4 2.6C7.6 5.4 7.6 3 8.5 1Z" fill={color} />
    </Svg>
  );
}

export function PersonIcon({ size = 18, color = '#6E84A4', strokeWidth = 2 }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Circle cx={12} cy={8} r={4} {...base(color, strokeWidth)} />
      <Path d="M5 20c1.5-4 4.5-6 7-6s5.5 2 7 6" {...base(color, strokeWidth)} />
    </Svg>
  );
}

export function ShieldCheckIcon({ size = 20, color = '#D8A94A', strokeWidth = 1.9 }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M12 3l8 3v5c0 5-3.5 8-8 10-4.5-2-8-5-8-10V6Z" {...base(color, strokeWidth)} />
      <Path d="M9 11.5l2 2 4-4.5" {...base(color, strokeWidth)} />
    </Svg>
  );
}

export function PennantIcon({ size = 11, color = '#D8A94A', strokeWidth = 2.4 }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M5 21V4M5 4h12l-3 4 3 4H5" {...base(color, strokeWidth)} />
    </Svg>
  );
}

export function SyncIcon({ size = 18, color = '#EEF3FA', strokeWidth = 2.2 }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M21 12a9 9 0 0 1-9 9 9 9 0 0 1-8-5M3 12a9 9 0 0 1 9-9 9 9 0 0 1 8 5" {...base(color, strokeWidth)} />
      <Path d="M20 4v4h-4M4 20v-4h4" {...base(color, strokeWidth)} />
    </Svg>
  );
}

// Settings row icons.
export function SettingsIcon({ name, size = 18, color = '#A8BBD4', strokeWidth = 1.9 }) {
  const p = base(color, strokeWidth);
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      {name === 'edit' && (
        <>
          <Path d="M4 20h4L18.5 9.5a2 2 0 0 0-3-3L5 17v3" {...p} />
          <Path d="M14 7l3 3" {...p} />
        </>
      )}
      {name === 'bell' && (
        <>
          <Path d="M6 9a6 6 0 0 1 12 0c0 5 2 6 2 6H4s2-1 2-6Z" {...p} />
          <Path d="M10 19a2 2 0 0 0 4 0" {...p} />
        </>
      )}
      {name === 'pin' && (
        <>
          <Path d="M19 10c0 6-7 11-7 11s-7-5-7-11a7 7 0 0 1 14 0Z" {...p} />
          <Circle cx={12} cy={10} r={2.5} {...p} />
        </>
      )}
      {name === 'people' && (
        <>
          <Circle cx={9} cy={8} r={3.2} {...p} />
          <Path d="M3 20c1-4 3.5-5.5 6-5.5s5 1.5 6 5.5" {...p} />
          <Circle cx={17} cy={9} r={2.4} {...p} />
          <Path d="M16 14.5c2 .3 3.6 1.7 4.4 4.3" {...p} />
        </>
      )}
      {name === 'shield' && <Path d="M12 3l8 3v5c0 5-3.5 8-8 10-4.5-2-8-5-8-10V6Z" {...p} />}
      {name === 'out' && (
        <>
          <Path d="M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3" {...p} />
          <Path d="M10 12H3M6 8l-3 4 3 4" {...p} />
        </>
      )}
    </Svg>
  );
}

export function Crown({ size = 24, color = '#D8A94A' }) {
  return (
    <Svg width={size} height={(size / 26) * 18} viewBox="0 0 26 18">
      <Path d="M3 15h20L21 6l-5 3.5L13 3 10 9.5 5 6 3 15Z" fill="none" stroke={color} strokeWidth={2} strokeLinejoin="round" />
    </Svg>
  );
}
