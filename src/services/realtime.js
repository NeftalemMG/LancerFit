import { io } from "socket.io-client";
import { useEffect } from "react";
import { API_BASE_URL } from "./apiClient";
import { getAccessToken } from "./tokenStore";

let socket = null;
function socketOrigin() { return API_BASE_URL.replace(/\/api\/?$/, ""); }

export async function connectRealtime() {
  const token = await getAccessToken();
  if (!token) return null;
  if (socket) socket.disconnect();
  socket = io(socketOrigin(), { auth: { token }, transports: ["websocket"] });
  return socket;
}
export function disconnectRealtime() {
  if (socket) { socket.disconnect(); socket = null; }
}
export function getSocket() { return socket; }
export function useRealtime(event, handler) {
  useEffect(() => {
    if (!socket) return undefined;
    socket.on(event, handler);
    return () => socket.off(event, handler);
  }, [event, handler]);
}