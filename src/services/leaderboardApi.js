import { api } from "./apiClient";

// Faculties ranked by AVERAGE xp per member.
export async function fetchFacultyLeaderboard() {
  const data = await api("/leaderboard/faculty");
  return data.leaderboard;
}
// Individual students across campus, ranked by their own xp.
export async function fetchCampusLeaderboard(limit = 50) {
  const data = await api(`/leaderboard/campus?limit=${limit}`);
  return data.leaderboard;
}