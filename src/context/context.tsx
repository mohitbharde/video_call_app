import React, {
  createContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

// Create a context with initial value null
// eslint-disable-next-line react-refresh/only-export-components
export const Socket = createContext<WebSocket | null>(
  new WebSocket("wss://video-call-app-lzus.onrender.com")
);

// Define props type for the context provider
interface SocketProviderProps {
  children: ReactNode;
}

export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
  const [ws, setWs] = useState<WebSocket | null>(null);

  useEffect(() => {
    const socket = new WebSocket("wss://video-call-app-lzus.onrender.com");

    setWs(socket);

    // Optionally handle cleanup
    return () => {
      socket.close();
    };
  }, []);

  return <Socket.Provider value={ws}>{children}</Socket.Provider>;
};
