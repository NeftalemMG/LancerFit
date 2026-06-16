import React, { useState } from 'react';
import { View, Text, StyleSheet, StatusBar } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Rect } from 'react-native-svg';
import { colors } from '../theme/tokens';
import { disp } from '../theme/typography';
import { useApp } from '../context/AppContext';

import OnboardingScreen from '../screens/OnboardingScreen';
import HomeScreen from '../screens/HomeScreen';
import ChallengesScreen from '../screens/ChallengesScreen';
import LeaderboardScreen from '../screens/LeaderboardScreen';
import BadgesScreen from '../screens/BadgesScreen';
import ProfileScreen from '../screens/ProfileScreen';

import TabBar from './TabBar';
import { Toast, Sheet, LogWorkoutSheet } from './Overlays';

function StatusBarRow() {
  return (
    <View style={styles.statusbar}>
      <Text style={styles.clock}>9:41</Text>
      <View style={styles.sig}>
        <Svg width={17} height={12} viewBox="0 0 17 12">
          <Rect x={0} y={7} width={3} height={5} rx={1} fill={colors.text} />
          <Rect x={4.5} y={4.5} width={3} height={7.5} rx={1} fill={colors.text} />
          <Rect x={9} y={2} width={3} height={10} rx={1} fill={colors.text} />
          <Rect x={13.5} y={0} width={3} height={12} rx={1} fill={colors.text} />
        </Svg>
        <Svg width={22} height={12} viewBox="0 0 24 13">
          <Rect x={1} y={1} width={20} height={11} rx={3} stroke={colors.text} strokeOpacity={0.5} strokeWidth={1.2} fill="none" />
          <Rect x={2.6} y={2.6} width={15} height={7.8} rx={1.6} fill={colors.text} />
          <Rect x={22} y={4} width={1.6} height={5} rx={1} fill={colors.text} fillOpacity={0.5} />
        </Svg>
      </View>
    </View>
  );
}

export default function AppShell() {
  const { addXP, toast, openSheet, closeSheet, updatePlayer } = useApp();
  const [screen, setScreen] = useState('onboard');
  const [tabbarVisible, setTabbarVisible] = useState(false);

  // Onboarding -> Home, reveal tab bar.
  const enterApp = (name) => {
    setScreen('home');
    setTabbarVisible(true);
    setTimeout(() => toast(`Welcome to LancerFit, ${name}`), 520);
  };

  const navigate = (key) => setScreen(key);

  const openLog = () => {
    openSheet(
      <LogWorkoutSheet
        onDone={(mode) => {
          closeSheet();
          setScreen('home');
          setTimeout(() => {
            if (mode === 'manual') { addXP(50); toast('Workout logged · +50 XP'); }
            else { addXP(30); toast('Synced from wearable · +30 XP'); }
          }, 260);
        }}
      />
    );
  };

  const renderScreen = () => {
    switch (screen) {
      case 'onboard':
        return <OnboardingScreen onEnter={enterApp} />;
      case 'home':
        return <HomeScreen goToQuests={() => navigate('quests')} />;
      case 'quests':
        return <ChallengesScreen />;
      case 'board':
        return <LeaderboardScreen />;
      case 'badges':
        return <BadgesScreen goToProfile={() => navigate('profile')} />;
      case 'profile':
        return (
          <ProfileScreen
            goToBadges={() => navigate('badges')}
            goToOnboarding={() => { setScreen('onboard'); setTabbarVisible(false); }}
          />
        );
      default:
        return null;
    }
  };

  // The active key used to highlight tabs (badges maps to profile group).
  const activeTab = screen === 'badges' ? 'profile' : screen;

  return (
    <View style={styles.phone}>
      <LinearGradient
        colors={[colors.bg1, colors.bg0, '#05203A']}
        locations={[0, 0.62, 1]}
        style={StyleSheet.absoluteFill}
      />
      <StatusBar barStyle="light-content" />
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        {screen !== 'onboard' && <StatusBarRow />}
        <View style={{ flex: 1 }}>{renderScreen()}</View>
      </SafeAreaView>

      {tabbarVisible && <TabBar active={activeTab} onNavigate={navigate} onLog={openLog} />}
      <Toast />
      <Sheet />
    </View>
  );
}

const styles = StyleSheet.create({
  phone: { flex: 1, backgroundColor: colors.appBg },
  statusbar: { height: 36, flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', paddingHorizontal: 30, paddingBottom: 7 },
  clock: { fontFamily: disp.semibold, fontSize: 14, color: colors.text },
  sig: { flexDirection: 'row', gap: 6, alignItems: 'center' },
});
