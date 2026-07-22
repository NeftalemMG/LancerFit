import { api } from "./apiClient";

export async function fetchAreas() {
  const data = await api("/area"); return data.areas;
}

// The backend is the single source of truth for the activity catalog. This
// adapts GET /api/area into the shape the log UI expects (backend `key` -> `id`,
// `activities` -> `subs`), so the exerciseKey/areaKey we log always match the
// backend catalog and badges resolve. Callers fall back to the bundled
// activityData if this fails.
export async function fetchCatalog() {
  const areas = await fetchAreas();
  return (areas || []).map((a) => ({
    id: a.key,
    name: a.name,
    icon: a.icon,
    accent: a.accent,
    subs: (a.activities || []).map((s) => ({
      id: s.key,
      name: s.name,
      icon: s.icon,
      hint: s.hint,
    })),
  }));
}
export async function fetchDailyQuests(date) {
  const q = date ? `?date=${encodeURIComponent(date)}` : "";
  const data = await api(`/quest/daily${q}`); return data.quests;
}