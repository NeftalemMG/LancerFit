import React from 'react';
import Svg, { Path, Circle, Rect, G, Text as SvgText } from 'react-native-svg';

// ============================================================
// BADGES — a shape (shield / hex / medal / pennant / star / diamond)
// plus a per-badge line icon, or a padlock when locked.
// Ported from the prototype's badgeSVG().
// ============================================================

const SHAPES = {
  shield: 'M50 8 L84 19 V50 Q84 78 50 92 Q16 78 16 50 V19 Z',
  hex: 'M50 7 L86 28 V72 L50 93 L14 72 V28 Z',
  medal: 'M50 10 A40 40 0 1 1 49.9 10 Z',
  pennant: 'M18 10 H82 V68 L50 92 L18 68 Z',
  diamond: 'M50 8 L90 50 L50 92 L10 50 Z',
  star: (() => {
    let p = '';
    for (let i = 0; i < 10; i++) {
      const a = (Math.PI / 5) * i - Math.PI / 2;
      const r = i % 2 ? 28 : 44;
      p += (i ? 'L' : 'M') + (50 + r * Math.cos(a)).toFixed(1) + ' ' + (50 + r * Math.sin(a)).toFixed(1) + ' ';
    }
    return p + 'Z';
  })(),
};

function BadgeIcon({ id, ink }) {
  switch (id) {
    case 'charge':
      return <Path d="M55 28 41 53h9l-3 19 13-26h-9l4-18Z" fill="none" stroke={ink} strokeWidth={3.6} strokeLinejoin="round" />;
    case 'iron':
      return <Path d="M52 32c1 6 8 9 8 17a8.5 8.5 0 0 1-17 0c0-4.5 3-6.8 4.6-10.4 1 2 2.4 3.3 3.6 4-.4-3.4-.4-7 .8-10.6Z" fill="none" stroke={ink} strokeWidth={3.4} strokeLinejoin="round" />;
    case 'dawn':
      return (
        <>
          <Circle cx={50} cy={54} r={9} fill="none" stroke={ink} strokeWidth={3.4} />
          <Path d="M50 38v-6M62 44l4-4M38 44l-4-4M30 54h-6M76 54h-6" stroke={ink} strokeWidth={3.4} strokeLinecap="round" />
          <Path d="M34 68h32" stroke={ink} strokeWidth={3.4} strokeLinecap="round" />
        </>
      );
    case 'laps':
      return <Path d="M28 48q6-6 12 0t12 0 12 0 12 0M28 60q6-6 12 0t12 0 12 0 12 0" fill="none" stroke={ink} strokeWidth={3.6} strokeLinecap="round" />;
    case 'squad':
      return (
        <>
          <Circle cx={41} cy={46} r={6.5} fill="none" stroke={ink} strokeWidth={3.4} />
          <Circle cx={59} cy={46} r={6.5} fill="none" stroke={ink} strokeWidth={3.4} />
          <Path d="M30 68c1.5-7 6-9.5 11-9.5M70 68c-1.5-7-6-9.5-11-9.5" fill="none" stroke={ink} strokeWidth={3.4} strokeLinecap="round" />
        </>
      );
    case 'tower':
      return (
        <>
          <Path d="M35 70V48l7-6v28M50 70V38l8-5v37M65 70V44" stroke={ink} strokeWidth={3.6} strokeLinecap="round" strokeLinejoin="round" fill="none" />
          <Path d="M30 70h40" stroke={ink} strokeWidth={3.6} strokeLinecap="round" />
        </>
      );
    case 'frost':
      return <Path d="M50 30v40M33 40l34 20M67 40 33 60M50 36l-5-5M50 36l5-5M50 64l-5 5M50 64l5 5" stroke={ink} strokeWidth={3.2} strokeLinecap="round" />;
    case 'pr':
      return (
        <>
          <Path d="M32 64l11-12 8 7 16-20" fill="none" stroke={ink} strokeWidth={3.6} strokeLinecap="round" strokeLinejoin="round" />
          <Path d="M56 39h11v11" fill="none" stroke={ink} strokeWidth={3.6} strokeLinecap="round" strokeLinejoin="round" />
        </>
      );
    case 'loyal':
      return <Path d="M37 53l8 8 18-20" fill="none" stroke={ink} strokeWidth={4.5} strokeLinecap="round" strokeLinejoin="round" />;
    case 'cent':
      return <SvgText x={50} y={60} textAnchor="middle" fontFamily="SpaceGrotesk_700Bold" fontWeight="800" fontSize={24} fill={ink}>100</SvgText>;
    case 'night':
      return <Path d="M60 34a18 18 0 1 0 7 24 14 14 0 0 1-7-24Z" fill="none" stroke={ink} strokeWidth={3.6} strokeLinejoin="round" />;
    case 'gauntlet':
      return (
        <>
          <Path d="M39 32h22v13a11 11 0 0 1-22 0V32Z" fill="none" stroke={ink} strokeWidth={3.6} strokeLinejoin="round" />
          <Path d="M44 60h12M41 68h18" fill="none" stroke={ink} strokeWidth={3.2} strokeLinecap="round" />
        </>
      );
    default:
      return null;
  }
}

export default function Badge({ badge, size = 68 }) {
  const dim = !badge.earned;
  const fill = dim ? 'rgba(255,255,255,0.05)' : badge.col + '22';
  const stroke = dim ? 'rgba(180,196,220,0.4)' : badge.col;
  const ink = dim ? 'rgba(180,196,220,0.5)' : badge.col;
  const shape = SHAPES[badge.shape];

  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Path d={shape} fill={fill} stroke={stroke} strokeWidth={2.8} strokeLinejoin="round" />
      {dim ? (
        <G transform="translate(50,52)">
          <Rect x={-8} y={-2} width={16} height={13} rx={3} fill="none" stroke={ink} strokeWidth={3.4} />
          <Path d="M-4.5 -2 v-3.5 a4.5 4.5 0 0 1 9 0 v3.5" fill="none" stroke={ink} strokeWidth={3.4} />
        </G>
      ) : (
        <BadgeIcon id={badge.id} ink={ink} />
      )}
    </Svg>
  );
}
