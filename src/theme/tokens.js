// ============================================================
// LANCERFIT · WINDSOR BLUE EDITION — design tokens
// Ported 1:1 from the prototype's CSS custom properties.
// Deep Windsor navy field, warm matte ochre, knight crests.
// ============================================================

export const colors = {
  // deep blue field
  bg0: '#06243F', // darkest base
  bg1: '#0A335A', // mid navy
  bg2: '#0E4072', // lifted navy
  fieldWarm: '#123A5E', // faint warm wash anchor
  appBg: '#0B2742', // body background behind the phone

  // translucent surfaces over the navy
  card: 'rgba(255,255,255,0.055)',
  card2: 'rgba(255,255,255,0.085)',
  cardLine: 'rgba(225,235,250,0.12)',
  cardLine2: 'rgba(225,235,250,0.20)',

  // ink on dark
  text: '#EEF3FA',
  text2: '#A8BBD4',
  text3: '#6E84A4',

  // brand accents
  blue: '#2F7BC4',
  blue2: '#4A93D8',
  blueSoft: 'rgba(47,123,196,0.18)',
  blueLine: 'rgba(74,147,216,0.34)',

  // subtle ochre (warm, matte — never shiny)
  gold: '#D8A94A',
  goldDim: '#B98E38',
  goldSoft: 'rgba(216,169,74,0.14)',
  goldLine: 'rgba(216,169,74,0.32)',
  goldInk: '#241A05', // text that sits on gold

  green: '#4FB587',
  greenSoft: 'rgba(79,181,135,0.16)',
  greenLine: 'rgba(79,181,135,0.4)',
  coral: '#E07A5F',
  plum: '#A98BC9',

  white: '#FFFFFF',
};

export const radius = {
  lg: 22,
  md: 16,
  sm: 12,
};

// React Native shadow approximations of the CSS box-shadows.
export const shadow = {
  card: {
    shadowColor: '#000',
    shadowOpacity: 0.4,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 10 },
    elevation: 6,
  },
  pop: {
    shadowColor: '#000',
    shadowOpacity: 0.5,
    shadowRadius: 26,
    shadowOffset: { width: 0, height: 14 },
    elevation: 12,
  },
  accent: (rgba) => ({
    shadowColor: rgba,
    shadowOpacity: 0.6,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 10 },
    elevation: 8,
  }),
};

// Faculty-tint helper that mimics the prototype's
// color-mix(in srgb, currentColor 14%, transparent).
export function tint(hex, alpha) {
  const h = hex.replace('#', '');
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}
