import {
  createContext,
  type Dispatch,
  type RefObject,
  type SetStateAction,
} from "react";

export interface SocketContextType {
  ws: WebSocket | null;
  peer: RefObject<RTCPeerConnection>;
  shutdown: boolean;
  setShutdown: Dispatch<SetStateAction<boolean>>;
}

export const Socket = createContext<SocketContextType | null>(null);
