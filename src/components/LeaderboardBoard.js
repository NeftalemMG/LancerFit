import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../theme/tokens';
import { disp } from '../theme/typography';
import { FACULTIES, fmt } from '../data/appData';
import KnightAvatar from './KnightAvatar';
import { Flag } from './Glyphs';
import { Crown } from './icons';
import LeaderboardRow from './LeaderboardRow';

const facultyInfo = (id) => {
  const f = FACULTIES.find((x) => x.id === id);
  return { color: f.c, label: f.name };
};

const PODIUM_ORDER = [1, 0, 2]; // visual slot order: 2nd, 1st, 3rd
const PODIUM_HEIGHTS = [58, 80, 46];

export default function LeaderboardBoard({ data, grp = false }) {
  if (!data || data.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>No rankings yet — be the first to join.</Text>
      </View>
    );
  }

  const top3 = data.slice(0, 3);
  const rest = data.slice(3);

  return (
    <View>
      <View style={styles.podium}>
        {PODIUM_ORDER.map((di, slot) => {
          const e = top3[di];
          if (!e) return <View key={slot} style={styles.pcol} />;
          const first = di === 0;
          const metal = di === 0 ? colors.medalGold : di === 1 ? colors.medalSilver : colors.medalBronze;
          const metalDim = di === 0 ? colors.medalGoldDim : di === 1 ? colors.medalSilverDim : colors.medalBronzeDim;
          return (
            <View key={slot} style={styles.pcol}>
              {first && <Crown size={24} color={colors.gold} />}
              <View style={[styles.pav, { borderColor: metal + '99', backgroundColor: metal + '1F' }, first && { width: 64, height: 64 }]}>
                <KnightAvatar variant={e.av} plume={facultyInfo(e.f).color} size={first ? 52 : 42} />
                {!grp && <View style={styles.flBadge}><Flag code={e.fl} width={16} /></View>}
              </View>
              <Text style={styles.pname} numberOfLines={1}>{e.n}</Text>
              <Text style={styles.pxp}>{fmt(e.xp)} XP</Text>
              <LinearGradient
                colors={[metal + '3A', metalDim + '20']}
                start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }}
                style={[styles.plinth, { height: PODIUM_HEIGHTS[slot], borderColor: metal + '66' }]}
              >
                <Text style={[styles.plinthNum, { color: metal }]}>{di + 1}</Text>
              </LinearGradient>
            </View>
          );
        })}
      </View>

      <View style={{ marginTop: 20 }}>
        {rest.map((e, i) => (
          <LeaderboardRow
            key={e.n ?? i}
            entry={e}
            rank={e.rank || i + 4}
            faction={facultyInfo(e.f)}
            showFlag={!grp}
            isYou={!!e.you}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  podium: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'center', gap: 10, marginTop: 24 },
  pcol: { flex: 1, maxWidth: 104, alignItems: 'center', gap: 7 },
  pav: { width: 52, height: 52, borderRadius: 14, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.cardLine, alignItems: 'center', justifyContent: 'center', overflow: 'visible' },
  flBadge: { position: 'absolute', bottom: -3, right: -3, zIndex: 3 },
  pname: { fontFamily: disp.semibold, fontSize: 12, letterSpacing: -0.1, color: colors.text, maxWidth: 96 },
  pxp: { fontFamily: disp.semibold, fontSize: 11, color: colors.text2 },
  plinth: { marginTop: 3, width: '100%', borderTopLeftRadius: 12, borderTopRightRadius: 12, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.cardLine, borderBottomWidth: 0, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  plinthNum: { fontFamily: disp.bold, fontSize: 22, color: colors.text3 },
  empty: { marginTop: 40, alignItems: 'center' },
  emptyText: { fontFamily: disp.semibold, fontSize: 13, color: colors.text3 },
});