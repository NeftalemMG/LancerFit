import { api } from "./apiClient";

export async function doCheckIn() {
  return api("/checkin", { method: "POST" });
}
export async function fetchCheckInStatus() {
  const data = await api("/checkin/status");
  return data.checkedInToday;
}