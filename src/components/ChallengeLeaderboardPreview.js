import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { colors } from '../theme/tokens';
import { disp, body } from '../theme/typography';
import { FACULTIES } from '../data/appData';
import LeaderboardRow from './LeaderboardRow';

// Maps a faculty id to the {color, label} shape LeaderboardRow expects.
function facultyInfo(facultyId) {
  const f = FACULTIES.find((x) => x.id === facultyId);
  return { color: f.c, label: f.name };
}

// Single job: show a short, ranked slice of a challenge's leaderboard
// This is what sits under the Join button in ChallengeSheet.
export default function ChallengeLeaderboardPreview({
  entries,
  userEntry,
  userRank,
  onViewAll,
  maxRows = 3,
}) {
  if (!entries || entries.length === 0) return null;

  const topRows = entries.slice(0, maxRows);
  const userIsInTopRows = userEntry && topRows.some((e) => e.n === userEntry.n);

  return (
    <View style={styles.wrap}>
      <View style={styles.header}>
        <Text style={styles.title}>Top participants</Text>
        <Pressable onPress={onViewAll} hitSlop={8}>
          <Text style={styles.link}>View full leaderboard →</Text>
        </Pressable>
      </View>

      {topRows.map((entry, i) => (
        <LeaderboardRow
          key={entry.n ?? i}
          entry={entry}
          rank={i + 1}
          faction={facultyInfo(entry.f)}
        />
      ))}

      {userEntry && !userIsInTopRows && (
        <LeaderboardRow
          entry={userEntry}
          rank={userRank}
          faction={facultyInfo(userEntry.f)}
          isYou
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignSelf: 'stretch', marginTop: 22 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  title: { fontFamily: disp.semibold, fontSize: 14.5, letterSpacing: -0.1, color: colors.text },
  link: { fontFamily: body.semibold, fontSize: 11.5, color: colors.blue2 },
});