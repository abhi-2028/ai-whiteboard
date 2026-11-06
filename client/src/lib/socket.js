import { io } from "socket.io-client";
import { getToken } from "./api";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:5050";
let socket = null;

export function getSocket() {
  if (!socket) {
    socket = io(SOCKET_URL, {
      autoConnect: false,
      auth: { token: getToken() },
      transports: ["websocket"],
    });
  }
  return socket;
}

export async function connectSocket() {
  const s = getSocket();
  // Refresh token just before connecting
  const token = await getToken();
  s.auth.token = token;
  if (!s.connected) s.connect();
  return s;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
  }
}

export function getSocketId() {
  return socket?.id || null;
}