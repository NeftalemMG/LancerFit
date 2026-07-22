import { api } from "./apiClient";

export async function fetchDailyQuests(date) {
  const query = date ? `?date=${encodeURIComponent(date)}` : "";
  const data = await api(`/quest/daily${query}`);
  return data.quests;
}

export async function awardQuestPoints(id) {
  const data = await api(`/quest/${id}/claim`,{ method: "POST" });
  return data;
}

// export async function setDailyQuests(date, questIds) {
//   return api("/quest/set-daily", { method: "PUT", body: { date, questIds } });
// }

// export async function clearDailyOverride(date) {
//   return api(`/quest/daily/${date}`, { method: "DELETE" });
// }

// export async function fetchAllQuests() {
//   const data = await api("/quest/list");
//   return data.quests;
// }

// export async function addQuest(title, xp, category) {
//   const data = await api("/quest/add", { method: "POST", body: { title, xp, category } });
//   return data.quest;
// }

// export async function removeQuest(questId) {
//   return api(`/quest/${questId}`, { method: "DELETE" });
// }
