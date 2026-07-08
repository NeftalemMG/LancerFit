import React, { useState, useRef, useEffect } from 'react';
import { View, Text, ScrollView, Pressable, Animated, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRoute, useNavigation } from '@react-navigation/native';
import { colors, shadow } from '../theme/tokens';
import { disp } from '../theme/typography';
import { LB } from '../data/appData';
import { useApp } from '../context/AppContext';
import { ScreenHeader } from '../components/ui';
import LeaderboardBoard from '../components/LeaderboardBoard';

const TABS = ['friends', 'faculty', 'campus'];
const TAB_LABELS = { friends: 'Friends', faculty: 'Faculty', campus: 'Campus' };

function ChallengeBoardHeader({ challenge, onBack }) {
  return (
    <>
      <ScreenHeader title={challenge.title} subtitle={`Top participants for this challenge · ${challenge.joined} joined`} />
      <Pressable onPress={onBack} hitSlop={8} style={styles.backLink}>
        <Text style={styles.backLinkText}>← All leaderboards</Text>
      </Pressable>
    </>
  );
}

function TabSwitcher({ tab, setTab }) {
  const [segWidth, setSegWidth] = useState(0);
  const pillX = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const idx = TABS.indexOf(tab);
    const unit = segWidth ? (segWidth - 8) / 3 : 0;
    Animated.spring(pillX, { toValue: idx * unit, useNativeDriver: true, speed: 18, bounciness: 4 }).start();
  }, [tab, segWidth, pillX]);

  return (
    <View style={styles.seg} onLayout={(e) => setSegWidth(e.nativeEvent.layout.width)}>
      <Animated.View style={[styles.segPill, { width: segWidth ? (segWidth - 8) / 3 : 0, transform: [{ translateX: pillX }] }]}>
        <LinearGradient colors={[colors.gold, colors.goldDim]} start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }} style={StyleSheet.absoluteFill} />
      </Animated.View>
      {TABS.map((t) => (
        <Pressable key={t} style={styles.segBtn} onPress={() => setTab(t)}>
          <Text style={[styles.segText, tab === t && { color: '#2A1E04' }]}>{TAB_LABELS[t]}</Text>
        </Pressable>
      ))}
    </View>
  );
}

export default function LeaderboardScreen() {
  const [tab, setTab] = useState('friends');
  const route = useRoute();
  const navigation = useNavigation();
  const { challenges } = useApp();

  const challengeId = route.params?.challengeId;
  const challenge = challengeId ? challenges.find((c) => c.id === challengeId) : null;

  const clearChallengeScope = () => navigation.setParams({ challengeId: undefined });

  return (
    <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
      {challenge ? (
        <>
          <ChallengeBoardHeader challenge={challenge} onBack={clearChallengeScope} />
          <LeaderboardBoard data={challenge.leaderboard} grp={false} />
        </>
      ) : (
        <>
          <ScreenHeader title="Leaderboard" subtitle="Resets every Sunday at midnight. Top 3 earn bonus XP." />
          <TabSwitcher tab={tab} setTab={setTab} />
          <LeaderboardBoard data={LB[tab]} grp={tab === 'faculty'} />
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingHorizontal: 20, paddingTop: 6, paddingBottom: 124 },

  seg: { flexDirection: 'row', backgroundColor: colors.card, borderWidth: 1, borderColor: colors.cardLine, borderRadius: 14, padding: 4, ...shadow.card },
  segPill: { position: 'absolute', top: 4, left: 4, bottom: 4, borderRadius: 10, overflow: 'hidden' },
  segBtn: { flex: 1, height: 38, alignItems: 'center', justifyContent: 'center' },
  segText: { fontFamily: disp.semibold, fontSize: 13, color: colors.text2 },

  backLink: { marginTop: 4 },
  backLinkText: { fontFamily: disp.semibold, fontSize: 12.5, color: colors.blue2 },
});