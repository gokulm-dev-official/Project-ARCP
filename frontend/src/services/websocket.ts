import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

let stompClient: Client | null = null;

export const websocketService = {
  connect(onConnect?: () => void, onDisconnect?: () => void): Client {
    if (stompClient?.active) return stompClient;

    stompClient = new Client({
      webSocketFactory: () => new SockJS('/ws'),
      reconnectDelay: 3000,
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,
      onConnect: () => {
        console.log('[WS] Connected');
        onConnect?.();
      },
      onDisconnect: () => {
        console.log('[WS] Disconnected');
        onDisconnect?.();
      },
      onStompError: (frame) => {
        console.error('[WS] STOMP error:', frame.headers['message']);
      },
    });

    stompClient.activate();
    return stompClient;
  },

  disconnect(): void {
    if (stompClient?.active) {
      stompClient.deactivate();
      stompClient = null;
    }
  },

  subscribe(destination: string, callback: (message: any) => void) {
    if (!stompClient?.active) {
      console.warn('[WS] Not connected, cannot subscribe to', destination);
      return null;
    }
    return stompClient.subscribe(destination, (msg) => {
      try {
        const body = JSON.parse(msg.body);
        callback(body);
      } catch {
        callback(msg.body);
      }
    });
  },

  send(destination: string, body: any): void {
    if (!stompClient?.active) {
      console.warn('[WS] Not connected, cannot send to', destination);
      return;
    }
    stompClient.publish({
      destination,
      body: JSON.stringify(body),
    });
  },

  getClient(): Client | null {
    return stompClient;
  },

  isConnected(): boolean {
    return stompClient?.active ?? false;
  },
};
