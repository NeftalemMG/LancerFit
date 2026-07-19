// A user's own "Other" activities: list, create, pin, delete. These persist on
// the backend so they survive restarts and sync across devices.
import { api } from "./apiClient";

export async function fetchCustomActivities() {
  const data = await api("/custom-activity");
  return data.activities;
}
export async function createCustomActivity(name) {
  const data = await api("/custom-activity", { method: "POST", body: { name } });
  return data.activity;
}
export async function pinCustomActivity(id, pinned) {
  const data = await api(`/custom-activity/${id}/pin`, { method: "PATCH", body: { pinned } });
  return data.activity;
}
export async function deleteCustomActivity(id) {
  await api(`/custom-activity/${id}`, { method: "DELETE" });
  return true;
}