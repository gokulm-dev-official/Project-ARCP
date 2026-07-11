import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { websocketService } from '@/services/websocket';

interface WebSocketContextType {
  isConnected: boolean;
  subscribe: (destination: string, callback: (msg: any) => void) => (() => void) | null;
  send: (destination: string, body: any) => void;
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

export function WebSocketProvider({ children }: { children: React.ReactNode }) {
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    websocketService.connect(
      () => setIsConnected(true),
      () => setIsConnected(false)
    );

    return () => {
      websocketService.disconnect();
    };
  }, []);

  const subscribe = useCallback((destination: string, callback: (msg: any) => void) => {
    const subscription = websocketService.subscribe(destination, callback);
    if (subscription) {
      return () => subscription.unsubscribe();
    }
    return null;
  }, []);

  const send = useCallback((destination: string, body: any) => {
    websocketService.send(destination, body);
  }, []);

  return (
    <WebSocketContext.Provider value={{ isConnected, subscribe, send }}>
      {children}
    </WebSocketContext.Provider>
  );
}

export function useWebSocket() {
  const context = useContext(WebSocketContext);
  if (!context) throw new Error('useWebSocket must be used within WebSocketProvider');
  return context;
}
