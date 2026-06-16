import React from 'react';
import Svg, { Path, Circle, Rect } from 'react-native-svg';

// ============================================================
// FACULTY CRESTS — one monoline glyph per faculty, drawn in the
// faculty colour (passed as `color`). Ported from FACULTIES[].g.
// ============================================================
export function FacultyCrest({ id, color, size = 21 }) {
  const common = { stroke: color, strokeWidth: 2, fill: 'none', strokeLinecap: 'round', strokeLinejoin: 'round' };
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      {id === 'cs' && (
        <Path d="M9 9 5 12.5 9 16M15 9l4 3.5L15 16M13 7l-2 10" {...common} />
      )}
      {id === 'eng' && (
        <>
          <Circle cx={12} cy={12} r={3.4} fill="none" stroke={color} strokeWidth={2} />
          <Path d="M12 4.5v2.2M12 17.3v2.2M19.5 12h-2.2M6.7 12H4.5M17.3 6.7l-1.6 1.6M8.3 15.7l-1.6 1.6M17.3 17.3l-1.6-1.6M8.3 8.3 6.7 6.7" stroke={color} strokeWidth={2} strokeLinecap="round" />
        </>
      )}
      {id === 'sci' && (
        <>
          <Path d="M10 4h4M10.5 4v5L6.5 17a2 2 0 0 0 1.8 3h7.4a2 2 0 0 0 1.8-3L13.5 9V4" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
          <Circle cx={10.5} cy={15} r={1} fill={color} />
          <Circle cx={13.5} cy={17} r={1} fill={color} />
        </>
      )}
      {id === 'biz' && (
        <>
          <Rect x={4.5} y={8.5} width={15} height={10} rx={1.8} fill="none" stroke={color} strokeWidth={2} />
          <Path d="M9 8.5V7a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v1.5M4.5 13h15" stroke={color} strokeWidth={2} strokeLinecap="round" />
        </>
      )}
      {id === 'kin' && (
        <>
          <Circle cx={12} cy={5.5} r={2.1} fill={color} />
          <Path d="M12 8v5m0 0-3 6m3-6 3 6M8 10.5l4-1 4 1" stroke={color} strokeWidth={2} fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </>
      )}
      {id === 'nur' && (
        <>
          <Path d="M12 20s-7-4.2-7-9.4A4.1 4.1 0 0 1 12 8a4.1 4.1 0 0 1 7 2.6C19 15.8 12 20 12 20Z" fill="none" stroke={color} strokeWidth={2} strokeLinejoin="round" />
          <Path d="M12 10.5v3M10.5 12h3" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
        </>
      )}
    </Svg>
  );
}

// ============================================================
// FLAGS — compact 20x14 SVG flags. Ported from flagSVG().
// ============================================================
export function Flag({ code = 'ca', width = 20 }) {
  const w = width;
  const h = Math.round(width * 0.7);
  return (
    <Svg width={w} height={h} viewBox="0 0 20 14">
      {code === 'ca' && (
        <>
          <Rect width={20} height={14} fill="#fff" />
          <Rect width={5} height={14} fill="#D52B1E" />
          <Rect x={15} width={5} height={14} fill="#D52B1E" />
          <Path d="M10 3l.7 2.2 2.2-.3-1.4 1.7 1.4 1.7-2.2-.3L10 11l-.7-2.3-2.2.3 1.4-1.7L7.1 4.9l2.2.3L10 3Z" fill="#D52B1E" />
        </>
      )}
      {code === 'et' && (
        <>
          <Rect width={20} height={4.67} y={0} fill="#078930" />
          <Rect width={20} height={4.67} y={4.67} fill="#FCDD09" />
          <Rect width={20} height={4.66} y={9.34} fill="#DA121A" />
          <Circle cx={10} cy={7} r={3.4} fill="#0F47AF" />
          <Path d="M10 4.4l.5 1.6h1.7l-1.35 1 .5 1.6L10 8.6l-1.35 1 .5-1.6-1.35-1h1.7L10 4.4Z" fill="#FCDD09" />
        </>
      )}
      {code === 'ng' && (
        <>
          <Rect width={6.67} height={14} x={0} fill="#008751" />
          <Rect width={6.66} height={14} x={6.67} fill="#fff" />
          <Rect width={6.67} height={14} x={13.33} fill="#008751" />
        </>
      )}
      {code === 'in' && (
        <>
          <Rect width={20} height={4.67} fill="#FF9933" />
          <Rect width={20} height={4.67} y={4.67} fill="#fff" />
          <Rect width={20} height={4.66} y={9.34} fill="#138808" />
          <Circle cx={10} cy={7} r={2} fill="none" stroke="#000080" strokeWidth={0.5} />
        </>
      )}
      {code === 'cn' && (
        <>
          <Rect width={20} height={14} fill="#DE2910" />
          <Path d="M3 2.2l.6 1.8H5.5L4 5.1l.6 1.8L3 5.8 1.4 6.9 2 5.1.5 4h1.9L3 2.2Z" fill="#FFDE00" />
          <Path d="M7 2l.3.7.7.1-.5.5.1.7L7 4.3l-.6.3.1-.7-.5-.5.7-.1L7 2Z" fill="#FFDE00" />
          <Path d="M8 4.4l.3.6.6.1-.45.45.1.65L8 5.9l-.55.35.1-.65L7.1 5.1l.6-.1L8 4.4Z" fill="#FFDE00" />
        </>
      )}
      {code === 'pk' && (
        <>
          <Rect width={20} height={14} fill="#01411C" />
          <Rect width={5} height={14} fill="#fff" />
          <Circle cx={12.5} cy={7} r={3.2} fill="#fff" />
          <Circle cx={13.5} cy={7} r={3.2} fill="#01411C" />
          <Path d="M15.2 5.4l.4 1.1 1.1.1-.85.7.3 1.1-1-.65-1 .65.3-1.1-.85-.7 1.1-.1.4-1.1Z" fill="#fff" />
        </>
      )}
      {code === 'br' && (
        <>
          <Rect width={20} height={14} fill="#009639" />
          <Path d="M10 2l8 5-8 5-8-5 8-5Z" fill="#FEDF00" />
          <Circle cx={10} cy={7} r={3} fill="#002776" />
        </>
      )}
      {code === 'fr' && (
        <>
          <Rect width={6.67} height={14} fill="#0055A4" />
          <Rect width={6.66} height={14} x={6.67} fill="#fff" />
          <Rect width={6.67} height={14} x={13.33} fill="#EF4135" />
        </>
      )}
    </Svg>
  );
}

// ============================================================
// QUEST GLYPHS — solid two-tone activity icons. Ported from qGlyph().
// `color` is the tile colour; `soft` is a translucent cutout.
// ============================================================
export function QuestGlyph({ name, color, size = 22 }) {
  const c = color;
  const soft = color + '40';
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      {name === 'bolt' && (
        <>
          <Path d="M12 2.5c.4 3.6 3.6 5.2 3.6 8.6a3.6 3.6 0 0 1-7.2 0c0-1.7.7-2.6 1.4-3.6.3 1 .9 1.6 1.5 1.9-.2-2.4.2-4.9.7-6.9Z" fill={c} />
          <Path d="M12 13.2a1.9 1.9 0 0 1-1.9 1.9 1.9 1.9 0 0 0 3.8 0A1.9 1.9 0 0 1 12 13.2Z" fill={soft} />
        </>
      )}
      {name === 'bar' && (
        <>
          <Rect x={3} y={9} width={2.4} height={6} rx={1} fill={c} />
          <Rect x={18.6} y={9} width={2.4} height={6} rx={1} fill={c} />
          <Rect x={5.8} y={7.5} width={2.4} height={9} rx={1} fill={c} />
          <Rect x={15.8} y={7.5} width={2.4} height={9} rx={1} fill={c} />
          <Rect x={8.4} y={11} width={7.2} height={2} rx={1} fill={soft} />
        </>
      )}
      {name === 'crew' && (
        <>
          <Circle cx={8.5} cy={7.5} r={2.6} fill={c} />
          <Path d="M3.6 17.5c0-3 2.2-4.6 4.9-4.6s4.9 1.6 4.9 4.6Z" fill={c} />
          <Circle cx={16.2} cy={8.6} r={2.1} fill={soft} />
          <Path d="M13 17.5c.2-2.6 1.7-4 3.2-4 2 0 3.6 1.5 3.6 4Z" fill={soft} />
        </>
      )}
      {name === 'wave' && (
        <>
          <Circle cx={16} cy={6.4} r={2} fill={c} />
          <Path d="M4 12.5c1.6-.9 2.8.4 4.4.4l4-2.3 3 1.8 2.6-1 .6 1.8-3.2 1.3-3-1.8-3.6 2.1c-1.8 0-3-1.2-4.4-.4Z" fill={c} />
          <Path d="M3.5 17q2-1.6 4 0t4 0 4 0 4 0" stroke={soft} strokeWidth={1.8} fill="none" strokeLinecap="round" />
        </>
      )}
      {name === 'sun' && (
        <>
          <Circle cx={12} cy={12.5} r={3.6} fill={c} />
          <Path d="M12 5.4V3.2M17 7.6l1.5-1.5M7 7.6 5.5 6.1" stroke={c} strokeWidth={1.9} strokeLinecap="round" />
          <Path d="M3 17.5h18" stroke={c} strokeWidth={2} strokeLinecap="round" />
          <Path d="M6.5 20.5h11" stroke={soft} strokeWidth={2} strokeLinecap="round" />
        </>
      )}
      {name === 'flag' && (
        <>
          <Path d="M6 21V4.2" stroke={c} strokeWidth={2.1} strokeLinecap="round" />
          <Path d="M7 4.4 17 6.6 13.6 9.4 17 12.2 7 10Z" fill={c} />
          <Path d="M5 21h6" stroke={soft} strokeWidth={2} strokeLinecap="round" />
        </>
      )}
    </Svg>
  );
}

// Map of quest icon -> default colour, matching the prototype's qIcons.
export const questIconColor = {
  bolt: '#4A93D8',
  bar: '#D8A94A',
  crew: '#4A93D8',
  wave: '#4A93D8',
  sun: '#D8A94A',
  flag: '#D8A94A',
};
