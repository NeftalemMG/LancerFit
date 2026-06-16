import React from 'react';
import { View, Text, ImageBackground, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../theme/tokens';
import { disp, body } from '../theme/typography';
import { useApp } from '../context/AppContext';
import { FALLBACK } from '../data/appData';
import { PressScale } from './ui';

export default function ChallengeSheet({ challenge: c }) {
  const { joinedChals, joinChallenge } = useApp();
  const joined = !!joinedChals[c.id];

  return (
    <View>
      <ImageBackground source={{ uri: c.img }} style={styles.photo} imageStyle={{ backgroundColor: FALLBACK[c.type]?.[1] }}>
        <LinearGradient colors={['rgba(8,42,71,0.1)', 'rgba(8,42,71,0.6)', '#0C3253']} locations={[0, 0.7, 1]} style={StyleSheet.absoluteFill} />
        <View style={styles.type}><Text style={styles.typeText}>{c.type}</Text></View>
      </ImageBackground>
      <View style={styles.bodyWrap}>
        <Text style={styles.h3}>{c.title}</Text>
        <Text style={styles.desc}>{c.desc}</Text>
        <View style={styles.stats}>
          <View style={styles.stat}><Text style={styles.statNum}>+{c.xp}</Text><Text style={styles.statLbl}>XP reward</Text></View>
          <View style={styles.stat}><Text style={styles.statNum}>{c.days}d</Text><Text style={styles.statLbl}>Window</Text></View>
          <View style={styles.stat}><Text style={styles.statNum}>{c.joined}</Text><Text style={styles.statLbl}>Joined</Text></View>
        </View>
        <PressScale onPress={() => joinChallenge(c)} style={{ marginTop: 18 }}>
          {joined ? (
            <View style={[styles.act, styles.actSec]}>
              <Text style={[styles.actText, { color: colors.text }]}>Joined — view progress</Text>
            </View>
          ) : (
            <LinearGradient colors={[colors.gold, colors.goldDim]} start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }} style={styles.act}>
              <Text style={styles.actText}>Join challenge</Text>
            </LinearGradient>
          )}
        </PressScale>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  photo: { height: 188, justifyContent: 'flex-end' },
  type: { position: 'absolute', left: 18, bottom: 14, backgroundColor: 'rgba(8,42,71,0.5)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.24)', paddingVertical: 7, paddingHorizontal: 11, borderRadius: 99 },
  typeText: { fontFamily: body.semibold, fontSize: 10, letterSpacing: 1.2, color: '#fff', textTransform: 'uppercase' },
  bodyWrap: { paddingHorizontal: 26, paddingTop: 18, paddingBottom: 32, alignItems: 'center' },
  h3: { fontFamily: disp.bold, fontSize: 21, letterSpacing: -0.5, color: colors.text, marginTop: 6 },
  desc: { marginTop: 10, color: colors.text2, fontSize: 14, lineHeight: 21, textAlign: 'center', maxWidth: 280, fontFamily: body.regular },
  stats: { flexDirection: 'row', gap: 10, marginTop: 18, alignSelf: 'stretch' },
  stat: { flex: 1, paddingVertical: 13, paddingHorizontal: 8, borderRadius: 14, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.cardLine, alignItems: 'center' },
  statNum: { fontFamily: disp.bold, fontSize: 19, color: colors.text },
  statLbl: { marginTop: 5, fontFamily: body.semibold, fontSize: 9.5, letterSpacing: 0.7, color: colors.text3, textTransform: 'uppercase' },
  act: { height: 50, borderRadius: 14, alignItems: 'center', justifyContent: 'center', alignSelf: 'stretch' },
  actSec: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.cardLine },
  actText: { fontFamily: disp.bold, fontSize: 14, color: colors.goldInk },
});
