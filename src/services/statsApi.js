import { api } from "./apiClient";

export async function logExercise(payload) {
  return api("/exercise/log", { method: "POST", body: payload });
}
export async function fetchHistory(limit = 50) {
  const data = await api(`/exercise/history?limit=${limit}`); return data.sessions;
}
export async function fetchLoggedExercises() {
  const data = await api("/stats/exercises"); return data.exercises;
}
export async function fetchSummary(range = "week") {
  return api(`/stats/summary?range=${range}`);
}
export async function fetchExerciseStats(exerciseKey, range = "week") {
  return api(`/stats/exercise/${encodeURIComponent(exerciseKey)}?range=${range}`);
}