import React from 'react';
import Svg, { Path, Rect, Circle, Defs, LinearGradient, Stop } from 'react-native-svg';

// ============================================================
// KNIGHT AVATARS — six helmet crests on a shield field.
// Ported path-for-path from the prototype's avatarSVG().
// `plume` tints the shield outline + crest feather (faculty colour).
// ============================================================

const N1 = '#0E2A4C';
const N2 = '#15406E';
const HI = '#2F66A6';
const G = '#D8A94A';
const GD = '#B98E38';

function Helm({ variant, plume }) {
  switch (variant) {
    case 0: // Vanguard — classic great-helm, horizontal visor
      return (
        <>
          <Path d="M30 30 Q50 14 70 30 L71 50 H29 Z" fill={N2} />
          <Path d="M50 16 Q60 18 70 30 L71 50 H50 Z" fill={HI} opacity={0.55} />
          <Path d="M29 50 H71 L64 76 Q50 85 36 76 Z" fill={N1} />
          <Rect x={29} y={44} width={42} height={9} rx={2} fill="#0A2038" />
          <Rect x={34} y={47} width={13} height={3.4} rx={1.7} fill={G} />
          <Rect x={53} y={47} width={13} height={3.4} rx={1.7} fill={G} />
          <Path d="M50 12 Q70 0 86 14 Q68 10 54 20 Z" fill={plume} />
          <Path d="M48 56 V74 M50 62 H66" stroke={GD} strokeWidth={2.4} strokeLinecap="round" opacity={0.85} />
        </>
      );
    case 1: // Tempest — swept winged helm
      return (
        <>
          <Path d="M32 34 Q50 16 68 34 L66 56 H34 Z" fill={N2} />
          <Path d="M50 18 Q62 22 68 34 L66 56 H50 Z" fill={HI} opacity={0.5} />
          <Path d="M34 56 H66 L60 78 Q50 84 40 78 Z" fill={N1} />
          <Path d="M33 40 L62 46 L62 52 L33 48 Z" fill="#0A2038" />
          <Path d="M37 43 L57 47.4 V50 L37 46.6 Z" fill={G} />
          <Path d="M30 32 Q10 26 6 12 Q22 18 34 22 Z" fill={plume} />
          <Path d="M70 32 Q90 26 94 12 Q78 18 66 22 Z" fill={plume} opacity={0.85} />
          <Path d="M50 14 V8" stroke={G} strokeWidth={3} strokeLinecap="round" />
        </>
      );
    case 2: // Bastion — round helm, cross visor
      return (
        <>
          <Circle cx={50} cy={44} r={26} fill={N2} />
          <Path d="M50 18 A26 26 0 0 1 76 44 H50 Z" fill={HI} opacity={0.5} />
          <Path d="M30 60 H70 L63 79 Q50 86 37 79 Z" fill={N1} />
          <Rect x={46.5} y={28} width={7} height={30} rx={3} fill="#0A2038" />
          <Rect x={32} y={42} width={36} height={7} rx={3} fill="#0A2038" />
          <Rect x={48.4} y={30} width={3.2} height={26} rx={1.6} fill={G} />
          <Rect x={34} y={44} width={32} height={3} rx={1.5} fill={G} />
          <Path d="M50 16 Q58 4 74 6 Q64 10 58 20 Z" fill={plume} />
        </>
      );
    case 3: // Specter — angular stealth visor
      return (
        <>
          <Path d="M28 36 L50 20 L72 36 L68 58 H32 Z" fill={N2} />
          <Path d="M50 20 L72 36 L68 58 H50 Z" fill={HI} opacity={0.45} />
          <Path d="M32 58 H68 L61 78 Q50 84 39 78 Z" fill={N1} />
          <Path d="M31 42 L69 38 L67 50 L33 52 Z" fill="#0A2038" />
          <Path d="M35 44.6 L65 41.5 L64.4 45 L35.5 48 Z" fill={plume} />
          <Path d="M44 16 L50 6 L56 16 Z" fill={G} />
        </>
      );
    case 4: // Solstice — radiant crown helm
      return (
        <>
          <Path d="M31 34 Q50 18 69 34 L68 54 H32 Z" fill={N2} />
          <Path d="M50 19 Q62 24 69 34 L68 54 H50 Z" fill={HI} opacity={0.5} />
          <Path d="M32 54 H68 L62 77 Q50 84 38 77 Z" fill={N1} />
          <Rect x={31} y={42} width={38} height={8} rx={3} fill="#0A2038" />
          <Circle cx={41} cy={46} r={2.4} fill={G} />
          <Circle cx={50} cy={46} r={2.4} fill={G} />
          <Circle cx={59} cy={46} r={2.4} fill={G} />
          <Path d="M36 24 L40 12 L44 22 M47 20 L50 6 L53 20 M56 22 L60 12 L64 24" stroke={plume} strokeWidth={4} strokeLinecap="round" fill="none" />
        </>
      );
    case 5: // Atlas — broad helm, chevron
      return (
        <>
          <Path d="M26 38 Q50 16 74 38 L70 56 H30 Z" fill={N2} />
          <Path d="M50 18 Q66 24 74 38 L70 56 H50 Z" fill={HI} opacity={0.5} />
          <Path d="M30 56 H70 L64 78 Q50 86 36 78 Z" fill={N1} />
          <Path d="M30 44 H70 V51 H30 Z" fill="#0A2038" />
          <Path d="M40 50.5 L50 45 L60 50.5" stroke={G} strokeWidth={3.4} strokeLinecap="round" strokeLinejoin="round" fill="none" />
          <Path d="M50 64 L56 70 L50 76 L44 70 Z" fill={plume} />
          <Path d="M46 14 H54 V8 H46 Z" fill={plume} />
        </>
      );
    default:
      return null;
  }
}

export default function KnightAvatar({ variant = 0, plume = '#D8A94A', size = 58 }) {
  const uid = `avg${variant}`;
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Defs>
        <LinearGradient id={uid} x1="0" y1="0" x2="1" y2="1">
          <Stop stopColor="#163A63" />
          <Stop offset="1" stopColor="#0A2238" />
        </LinearGradient>
      </Defs>
      <Path
        d="M50 3 L89 16 V52 Q89 80 50 97 Q11 80 11 52 V16 Z"
        fill={`url(#${uid})`}
        stroke={plume}
        strokeWidth={2}
        strokeOpacity={0.55}
      />
      <Helm variant={variant} plume={plume} />
    </Svg>
  );
}
