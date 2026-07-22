import { api } from "./apiClient";

export async function fetchMyBadges() {
  const data = await api("/badge/me");
  return data.data;
}

export async function fetchAllBadges() {
  const data = await api("/badge/all", { auth: false });
  return data.data;
}
