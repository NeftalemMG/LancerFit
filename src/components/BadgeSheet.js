import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { colors } from '../theme/tokens';
import { disp, body } from '../theme/typography';
import Badge from './Badge';

// Catalog exercise/area keys → friendly label. Keys match the backend catalog
// (GET /api/area) which is the single source of truth; the raw key is used as a
// fallback for anything not listed here.
const KEY_LABEL = {
  // Pool
  fitlane: 'Fit Lanes', shallow: 'Shallow Aquafit', deep: 'Deep Water Aquafit',
  leisure: 'Leisure Swim', rec: 'Rec Swim', lessons: 'Swim Lessons',
  // Fitness Centre
  cardio: 'Cardio', strength: 'Strength', flex: 'Flexibility & Stretch', boxing: 'Boxing',
  // Group Fitness
  spin: 'Spin', lancerlift: 'Lancer Lift', bootcamp: 'Bootcamp', kickbox: 'Kickboxing',
  hyrox: 'HYROX', yoga: 'Yoga', zumba: 'Zumba', karate: 'Karate',
  // Open Rec & Courts
  pickleball: 'Pickleball', badminton: 'Badminton', tabletennis: 'Table Tennis',
  volleyball: 'Volleyball', basketball: 'Basketball', track: 'Walking Track',
  // Intramural Leagues
  imbasket: 'Basketball', imvolley: 'Volleyball', soccer: 'Soccer', futsal: 'Futsal', flagfb: 'Flag Football',
  // Areas
  pool: 'Pool', fitness: 'Fitness', group: 'Group Fitness', courts: 'Courts', intramural: 'Intramural',
};
function targetLabel(meta) {
  if (meta?.scope === 'any') return 'Any Exercise';
  return KEY_LABEL[meta?.targetKey] ?? (meta?.targetKey ?? 'Exercise');
}

function typeLabel(b) {
  const { type, meta } = b;
  if (type === 'challenge_position') {
    const pos = meta?.position ? meta.position.charAt(0).toUpperCase() + meta.position.slice(1) : '';
    return `Challenge · ${pos} place`;
  }
  if (type === 'exercise_frequency') {
    return `${targetLabel(meta)} · Frequency · Tier ${meta?.tier ?? ''}`;
  }
  if (type === 'exercise_streak') {
    return `${targetLabel(meta)} · Streak · Tier ${meta?.tier ?? ''}`;
  }
  if (type === 'activity_frequency') {
    const scope = meta?.scope === 'any' ? 'Any Activity' : (meta?.category ?? 'Activity');
    return `Activity · ${scope} · Frequency · Tier ${meta?.tier ?? ''}`;
  }
  if (type === 'activity_magnitude') {
    const scope = meta?.category ?? 'Activity';
    return `Activity · ${scope} · Magnitude · Tier ${meta?.tier ?? ''}`;
  }
  if (type === 'activity_streak') {
    const scope = meta?.scope === 'any' ? 'Any Activity' : (meta?.category ?? 'Activity');
    return `Streak · ${scope} · Tier ${meta?.tier ?? ''}`;
  }
  if (type === 'quest_frequency') return `Daily Quest · Frequency · Tier ${meta?.tier ?? ''}`;
  if (type === 'quest_streak')    return `Daily Quest · Streak · Tier ${meta?.tier ?? ''}`;
  if (type === 'specialty')       return 'Specialty';
  return '';
}

function formatDate(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('en-CA', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function BadgeSheet({ badge: b }) {
  return (
    <View style={styles.wrap}>
      <Badge badge={b} size={112} />
      <Text style={styles.h3}>{b.name}</Text>
      <Text style={styles.typeLabel}>{typeLabel(b)}</Text>
      <Text style={styles.desc}>{b.description}</Text>
      {b.isEarned ? (
        <View style={styles.row}>
          <View style={styles.earnedTag}>
            <Svg width={13} height={13} viewBox="0 0 24 24">
              <Path d="M5 12.5l5 5L19 6.5" fill="none" stroke={colors.green} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
            </Svg>
            <Text style={styles.earnedText}>Earned · {formatDate(b.earnedAt)}</Text>
          </View>
          <View style={styles.xpTag}>
            <Text style={styles.xpText}>+{b.xp} XP</Text>
          </View>
        </View>
      ) : (
        <View style={[styles.earnedTag, styles.lockedTag]}>
          <Svg width={12} height={12} viewBox="0 0 24 24">
            <Path d="M5 11h14v9H5z" fill="none" stroke={colors.text3} strokeWidth={2.4} />
            <Path d="M8 11V8a4 4 0 0 1 8 0v3" fill="none" stroke={colors.text3} strokeWidth={2.4} />
          </Svg>
          <Text style={[styles.earnedText, { color: colors.text3 }]}>Locked</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', paddingHorizontal: 26, paddingTop: 4, paddingBottom: 10 },
  h3: { fontFamily: disp.bold, fontSize: 21, letterSpacing: -0.5, marginTop: 14, color: colors.text, textAlign: 'center' },
  typeLabel: { marginTop: 5, fontFamily: disp.semibold, fontSize: 11, letterSpacing: 0.3, color: colors.text3, textTransform: 'uppercase', textAlign: 'center' },
  desc: { marginTop: 10, color: colors.text2, fontSize: 14, lineHeight: 21, textAlign: 'center', maxWidth: 280, fontFamily: body.regular },
  row: { flexDirection: 'row', gap: 8, marginTop: 18, alignItems: 'center' },
  earnedTag: { flexDirection: 'row', alignItems: 'center', gap: 7, marginTop: 18, paddingVertical: 9, paddingHorizontal: 16, borderRadius: 99, backgroundColor: colors.greenSoft, borderWidth: 1, borderColor: colors.greenLine },
  lockedTag: { backgroundColor: colors.card, borderColor: colors.cardLine, marginTop: 18 },
  earnedText: { fontFamily: disp.bold, fontSize: 12, letterSpacing: 0.4, color: colors.green },
  xpTag: { paddingVertical: 9, paddingHorizontal: 14, borderRadius: 99, backgroundColor: colors.goldSoft, borderWidth: 1, borderColor: colors.goldLine },
  xpText: { fontFamily: disp.bold, fontSize: 12, letterSpacing: 0.4, color: colors.gold },
});
