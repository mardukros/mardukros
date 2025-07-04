import { useEffect, useRef, useState, useCallback } from "react";

interface UseWebSocketOptions {
  onMessage?: (event: MessageEvent) => void;
  onOpen?: () => void;
  onClose?: () => void;
  onError?: (event: Event) => void;
  reconnectAttempts?: number;
}

export function useWebSocket(
  url: string,
  { onMessage, onOpen, onClose, onError, reconnectAttempts = 5 }: UseWebSocketOptions = {}
) {
  const [connected, setConnected] = useState(false);
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const attempts = useRef(0);
  const reconnectTimeout = useRef<NodeJS.Timeout | null>(null);

  const connect = useCallback(() => {
    if (wsRef.current) wsRef.current.close();
    const ws = new WebSocket(url);
    wsRef.current = ws;
    setSocket(ws);

    ws.onopen = () => {
      setConnected(true);
      attempts.current = 0;
      onOpen && onOpen();
    };

    ws.onmessage = (event) => {
      onMessage && onMessage(event);
    };

    ws.onerror = (event) => {
      onError && onError(event);
    };

    ws.onclose = () => {
      setConnected(false);
      onClose && onClose();
      if (attempts.current < reconnectAttempts) {
        const delay = Math.min(1000 * Math.pow(1.5, attempts.current), 30000);
        attempts.current += 1;
        reconnectTimeout.current = setTimeout(connect, delay);
      }
    };
  }, [url, onMessage, onOpen, onClose, onError, reconnectAttempts]);

  useEffect(() => {
    connect();
    return () => {
      if (wsRef.current) wsRef.current.close();
      if (reconnectTimeout.current) clearTimeout(reconnectTimeout.current);
    };
  }, [connect]);

  return { connected, ws: socket };
}
