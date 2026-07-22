import React from 'react';
import { View, Image, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path, Rect } from 'react-native-svg';
import { colors } from '../theme/tokens';
import { SportIcon } from './SportIcons';

// Maps meta.category (backend string, old activity path) → SportIcon name
const CATEGORY_ICON = {
  Swimming:    'lane',
  Fitness:     'dumbbell',
  Group:       'group',
  Courts:      'court',
  Intramural:  'court',
};

// Exercise-path badges. meta.targetKey = canonical catalog key (§4.6 BADGES.md).
// scope "exercise" → per-exercise key; scope "area" → area key; scope "any" → null.
const EXERCISE_ICON = {
  'fit-lanes':         'lane',
  'leisure-swim':      'leisure',
  'recreational-swim': 'recswim',
  'cardio':            'treadmill',
  'strength':          'barbell',
  'boxing':            'boxing',
  'spin':              'spin',
  'yoga':              'yoga',
  'bootcamp':          'bootcamp',
  'basketball':        'basketball',
  'badminton':         'shuttle',
  'walking-track':     'track',
};
const AREA_ICON = {
  pool:    'pool',
  fitness: 'dumbbell',
  group:   'group',
  courts:  'court',
};

// Accent color by badge type / challenge position
function accentFor(badge) {
  const { type, meta } = badge;
  if (type === 'challenge_position') {
    if (meta?.position === 'gold')        return colors.medalGold;
    if (meta?.position === 'silver')      return colors.medalSilver;
    if (meta?.position === 'bronze')      return colors.medalBronze;
    return colors.text2; // participant
  }
  if (type === 'exercise_frequency')  return colors.blue2;
  if (type === 'exercise_streak')     return colors.green;
  if (type === 'activity_frequency')  return colors.blue2;
  if (type === 'activity_magnitude')  return colors.coral;
  if (type === 'activity_streak')     return colors.green;
  if (type === 'quest_frequency' || type === 'quest_streak') return colors.gold;
  if (type === 'specialty')           return colors.plum;
  return colors.blue2;
}

export function badgeAccent(badge) { return accentFor(badge); }

function iconNameFor(badge) {
  const { type, meta } = badge;
  if (type === 'challenge_position' || type === 'quest_frequency' || type === 'quest_streak' || type === 'specialty') {
    return 'trophy';
  }
  // exercise_* — derive from scope + targetKey (§4.4/§4.6 BADGES.md)
  if (type === 'exercise_frequency' || type === 'exercise_streak') {
    if (meta?.scope === 'exercise') return EXERCISE_ICON[meta?.targetKey] ?? 'dumbbell';
    if (meta?.scope === 'area')     return AREA_ICON[meta?.targetKey] ?? 'dumbbell';
    return 'trophy'; // scope "any"
  }
  // activity_* (legacy path) — derive from category
  return CATEGORY_ICON[meta?.category] ?? 'dumbbell';
}

function Padlock({ size }) {
  const c = 'rgba(168,187,212,0.4)';
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Rect x={4} y={11} width={16} height={11} rx={2.5} fill="none" stroke={c} strokeWidth={1.8} />
      <Path d="M8 11V8.5a4 4 0 0 1 8 0V11" fill="none" stroke={c} strokeWidth={1.8} strokeLinecap="round" />
    </Svg>
  );
}

export default function Badge({ badge, size = 68 }) {
  const accent = accentFor(badge);
  const cr = size * 0.24;
  const iconSize = size * 0.46;
  const lockSize = size * 0.40;
  const base = { width: size, height: size, borderRadius: cr };

  // ── Locked ───────────────────────────────────────────────────
  if (!badge.isEarned) {
    return (
      <View style={[styles.base, styles.locked, base]}>
        <Padlock size={lockSize} />
      </View>
    );
  }

  // ── Earned ───────────────────────────────────────────────────
  const iconName = iconNameFor(badge);

  return (
    <LinearGradient
      colors={[accent + '38', accent + '18']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.base, base, { borderColor: accent + '66' }]}
    >
      {badge.image ? (
        <Image
          source={{ uri: badge.image }}
          style={{ width: iconSize, height: iconSize }}
          resizeMode="contain"
        />
      ) : (
        <SportIcon name={iconName} size={iconSize} color={accent} strokeWidth={1.8} />
      )}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  locked: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderColor: 'rgba(225,235,250,0.09)',
  },
});
