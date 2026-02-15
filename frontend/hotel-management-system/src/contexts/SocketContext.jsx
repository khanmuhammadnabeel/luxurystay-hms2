import { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { io } from 'socket.io-client';

// -----------------------------------------------------------------------------
// Socket configuration
// -----------------------------------------------------------------------------
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

const SOCKET_OPTIONS = {
  transports: ['websocket'],
  autoConnect: false,
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  timeout: 10000,
};

const PING_INTERVAL_MS = 30000;

const SocketContext = createContext();

export function SocketProvider({ children }) {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const [connectionError, setConnectionError] = useState(null);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);

  const socketRef = useRef(null);
  const pingIntervalRef = useRef(null);

  // ---------------------------------------------------------------------------
  // Clear ping interval
  // ---------------------------------------------------------------------------
  const clearPingInterval = useCallback(() => {
    if (pingIntervalRef.current) {
      clearInterval(pingIntervalRef.current);
      pingIntervalRef.current = null;
    }
  }, []);

  // ---------------------------------------------------------------------------
  // disconnect() – disconnect and clean up
  // ---------------------------------------------------------------------------
  const disconnect = useCallback(() => {
    try {
      clearPingInterval();
      const s = socketRef.current;
      if (s) {
        s.removeAllListeners();
        s.disconnect();
        socketRef.current = null;
      }
      setSocket(null);
      setConnected(false);
      setConnectionError(null);
    } catch (e) {
      setConnectionError(e?.message ?? 'Disconnect failed');
    }
  }, [clearPingInterval]);

  // ---------------------------------------------------------------------------
  // connect(token) – initialize socket with auth and connect
  // ---------------------------------------------------------------------------
  const connect = useCallback((token) => {
    try {
      setConnectionError(null);
      disconnect();

      const socketInstance = io(SOCKET_URL, {
        ...SOCKET_OPTIONS,
        auth: { token },
      });

      socketRef.current = socketInstance;
      setSocket(socketInstance);

      socketInstance.on('connect', () => {
        setConnected(true);
        setConnectionError(null);
        setReconnectAttempts(0);
        clearPingInterval();
        pingIntervalRef.current = setInterval(() => {
          if (socketRef.current?.connected) {
            socketRef.current.emit('ping');
          }
        }, PING_INTERVAL_MS);
      });

      socketInstance.on('disconnect', () => {
        setConnected(false);
        clearPingInterval();
      });

      socketInstance.on('connect_error', (err) => {
        setConnected(false);
        setConnectionError(err?.message ?? 'Connection failed');
      });

      socketInstance.on('reconnect_attempt', (attempt) => {
        setReconnectAttempts(attempt);
      });

      socketInstance.on('reconnect_failed', () => {
        setConnectionError('Reconnection failed after max attempts');
      });

      socketInstance.on('pong', () => {
        // Heartbeat response received; connection alive
      });

      socketInstance.connect();
    } catch (e) {
      setConnectionError(e?.message ?? 'Connection failed');
      setConnected(false);
    }
  }, [disconnect, clearPingInterval]);

  // ---------------------------------------------------------------------------
  // reconnect() – manual reconnection (uses existing socket)
  // ---------------------------------------------------------------------------
  const reconnect = useCallback(() => {
    try {
      setConnectionError(null);
      if (socketRef.current) {
        socketRef.current.connect();
      }
    } catch (e) {
      setConnectionError(e?.message ?? 'Reconnect failed');
    }
  }, []);

  // ---------------------------------------------------------------------------
  // on(event, callback) – register listener; return cleanup
  // ---------------------------------------------------------------------------
  const on = useCallback((event, callback) => {
    const s = socketRef.current;
    if (!s) return () => {};
    try {
      s.on(event, callback);
      return () => {
        try {
          s.off(event, callback);
        } catch (_) {}
      };
    } catch (_) {
      return () => {};
    }
  }, []);

  // ---------------------------------------------------------------------------
  // off(event, callback) – remove listener
  // ---------------------------------------------------------------------------
  const off = useCallback((event, callback) => {
    try {
      socketRef.current?.off(event, callback);
    } catch (_) {}
  }, []);

  // ---------------------------------------------------------------------------
  // emit(event, data) – only when connected
  // ---------------------------------------------------------------------------
  const emit = useCallback((event, data) => {
    try {
      if (connected && socketRef.current) {
        socketRef.current.emit(event, data);
      }
    } catch (e) {
      setConnectionError(e?.message ?? 'Emit failed');
    }
  }, [connected]);

  // ---------------------------------------------------------------------------
  // Cleanup on unmount
  // ---------------------------------------------------------------------------
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  const value = {
    socket,
    connected,
    connectionError,
    reconnectAttempts,
    connect,
    disconnect,
    reconnect,
    on,
    off,
    emit,
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
}

export const useSocket = () => useContext(SocketContext);
