// ============================================================
// TYPOGRAPHY
// The original prototype used Inter Tight (display) + Inter (body).
// Per the brief we swap the display face for Space Grotesk: a
// geometric, slightly technical sans that keeps the calm/premium
// Windsor feel while reading as more modern and distinctive.
// Inter stays as the body/utility face.
//
// Font family strings below must match the keys we register in
// App.js via useFonts(). Weighted variants are separate files in
// React Native, so we map weight -> explicit family name.
// ============================================================

// Display = Space Grotesk
export const disp = {
  regular: 'SpaceGrotesk_400Regular',
  medium: 'SpaceGrotesk_500Medium',
  semibold: 'SpaceGrotesk_600SemiBold',
  bold: 'SpaceGrotesk_700Bold',
};

// Body = Inter
export const body = {
  regular: 'Inter_400Regular',
  medium: 'Inter_500Medium',
  semibold: 'Inter_600SemiBold',
};

// Convenience text style builders. Letter spacing in RN is an
// absolute value (px-equivalent), so the em values from CSS are
// converted to rough absolute numbers at the given size.
export const type = {
  h1: { fontFamily: disp.bold, fontSize: 27, letterSpacing: -0.5, color: '#EEF3FA' },
  bigTitle: { fontFamily: disp.bold, fontSize: 34, letterSpacing: -1, color: '#FFFFFF' },
  eyebrow: { fontFamily: body.semibold, fontSize: 11, letterSpacing: 1.4, color: '#6E84A4' },
  sectionLabel: { fontFamily: body.semibold, fontSize: 11, letterSpacing: 1.3, color: '#6E84A4' },
  num: { fontFamily: disp.bold, fontVariant: ['tabular-nums'] },
};
