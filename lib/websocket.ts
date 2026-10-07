import { io, Socket } from "socket.io-client";
import { tokenStorage } from "./api";

const WS_BASE_URL =
  process.env.NEXT_PUBLIC_WS_URL ||
  (process.env.NEXT_PUBLIC_API_URL
    ? process.env.NEXT_PUBLIC_API_URL.replace(/\/api\/v1\/?$/, "")
    : "http://localhost:4000");

class WebSocketManager {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  public connect(): Socket {
    if (this.socket && (this.socket.connected || this.socket.active)) {
      return this.socket;
    }

    const token = tokenStorage.getAccessToken();

    this.socket = io(WS_BASE_URL, {
      path: "/socket.io",
      transports: ["websocket", "polling"],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: this.maxReconnectAttempts,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      withCredentials: true,
      auth: {
        token: token ? `Bearer ${token}` : undefined,
      },
    });

    this.socket.on("connect", () => {
      this.reconnectAttempts = 0;
    });

    this.socket.on("connect_error", () => {
      this.reconnectAttempts++;
    });

    return this.socket;
  }

  public getSocket(): Socket | null {
    return this.socket;
  }

  public disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  public joinIncident(incidentId: string): void {
    if (this.socket?.connected) {
      this.socket.emit("join:incident", { incidentId });
    }
  }

  public leaveIncident(incidentId: string): void {
    if (this.socket?.connected) {
      this.socket.emit("leave:incident", { incidentId });
    }
  }
}

export const wsManager = new WebSocketManager();
