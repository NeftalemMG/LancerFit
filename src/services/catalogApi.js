import { api } from "./apiClient";

export async function fetchAreas() {
  const data = await api("/area"); return data.areas;
}
export async function fetchDailyQuests(date) {
  const q = date ? `?date=${encodeURIComponent(date)}` : "";
  const data = await api(`/quest/daily${q}`); return data.quests;
}