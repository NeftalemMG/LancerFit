// The live profile endpoint. Returns the signed-in user with derived level,
// streak (consecutive days with a logged activity), and today's status.
import { api } from "./apiClient";

export async function fetchMe() {
  const data = await api("/user/me");
  return data.user;
}