import { api } from "./apiClient";

export async function fetchActiveChallenges() {
  const data = await api("/challenge/active", { auth: false }); return data.challenges;
}
export async function fetchAllChallenges() {
  const data = await api("/challenge/all", { auth: false }); return data.challenges;
}
export async function fetchMyChallenges() {
  const data = await api("/challenge/me"); return data.challenges;
}
export async function joinChallenge(challengeId) {
  return api(`/challenge/${challengeId}/register`, { method: "POST" });
}
export async function submitChallengePoints(challengeId, pointsSubmitted) {
  return api(`/challenge/${challengeId}/submit-points`, { method: "POST", body: { pointsSubmitted } });
}
export async function fetchChallengeLeaderboard(challengeId) {
  const data = await api(`/challenge/${challengeId}/leaderboard`); return data.leaderboard;
}