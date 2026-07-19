import React from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, radius } from '../theme/tokens';
import { disp, body } from '../theme/typography';
import { useApp } from '../context/AppContext';
import { BADGES } from '../data/appData';
import Badge from '../components/Badge';
import { Card, PressScale } from '../components/ui';
import { ChevronLeft } from '../components/icons';
import BadgeSheet from '../components/BadgeSheet';

export default function BadgesScreen({ navigation }) {
  const { openSheet } = useApp();
  const insets = useSafeAreaInsets();

  const earned = BADGES.filter((b) => b.earned).length;
  const total = BADGES.length;
  const inProgress = BADGES.filter((b) => !b.earned && b.progress).length || Math.max(0, total - earned - BADGES.filter((b) => !b.earned && !b.progress).length);

  return (
    <ScrollView
      contentContainerStyle={[styles.scroll, { paddingTop: Math.max(insets.top - 6, 6), paddingBottom: insets.bottom + 124 }]}
      showsVerticalScrollIndicator={false}
    >
      {/* Gold text-only back button, consistent with the rest of the app. */}
      <Pressable
        onPress={() => (navigation?.canGoBack?.() ? navigation.goBack() : navigation.navigate('profile'))}
        hitSlop={12}
        style={({ pressed }) => [styles.backBtn, pressed && { opacity: 0.6 }]}
      >
        <ChevronLeft size={16} color={colors.gold} strokeWidth={2.8} />
        <Text style={styles.backText}>Profile</Text>
      </Pressable>

      <View style={{ paddingBottom: 16 }}>
        <Text style={styles.h1}>Badges</Text>
        <Text style={styles.sub}>Unlock milestones as you train. Tap any badge to see how it's earned.</Text>
      </View>

      <View style={styles.bstats}>
        <Card style={styles.bstat}><Text style={[styles.bstatV, { color: colors.gold }]}>{earned}</Text><Text style={styles.bstatK}>Earned</Text></Card>
        <Card style={styles.bstat}><Text style={[styles.bstatV, { color: colors.blue2 }]}>{total}</Text><Text style={styles.bstatK}>Total</Text></Card>
        <Card style={styles.bstat}><Text style={styles.bstatV}>{inProgress}</Text><Text style={styles.bstatK}>In progress</Text></Card>
      </View>

      <View style={styles.grid}>
        {BADGES.map((b) => (
          <PressScale key={b.id} onPress={() => openSheet(<BadgeSheet badge={b} />)} wrapStyle={styles.cellWrap}>
            <Card style={[styles.cell, !b.earned && { opacity: 0.55 }]}>
              <Badge badge={b} size={58} />
              <Text
                style={[styles.bn, !b.earned && { color: colors.text3 }]}
                numberOfLines={2}
                adjustsFontSizeToFit
                minimumFontScale={0.85}
              >
                {b.name}
              </Text>
            </Card>
          </PressScale>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingHorizontal: 20 },
  backBtn: { flexDirection: 'row', alignItems: 'center', gap: 3, alignSelf: 'flex-start', paddingVertical: 6, marginBottom: 8 },
  backText: { fontFamily: disp.bold, fontSize: 15, color: colors.gold, letterSpacing: -0.2 },
  h1: { fontFamily: disp.bold, fontSize: 27, letterSpacing: -0.5, color: colors.text },
  sub: { marginTop: 7, color: colors.text2, fontSize: 14, lineHeight: 20, fontFamily: body.regular },

  bstats: { flexDirection: 'row', gap: 10 },
  bstat: { flex: 1, paddingVertical: 16, paddingHorizontal: 12, borderRadius: radius.md, alignItems: 'center' },
  bstatV: { fontFamily: disp.bold, fontSize: 24, color: colors.text },
  bstatK: { marginTop: 6, fontFamily: body.medium, fontSize: 11, color: colors.text2 },

  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginTop: 18, rowGap: 11 },
  cellWrap: { width: '31.5%' },
  cell: { alignItems: 'center', gap: 9, paddingTop: 16, paddingBottom: 13, paddingHorizontal: 8, borderRadius: radius.md, minHeight: 118, justifyContent: 'center' },
  bn: { fontFamily: disp.semibold, fontSize: 11.5, textAlign: 'center', letterSpacing: -0.1, color: colors.text, width: '100%' },
});