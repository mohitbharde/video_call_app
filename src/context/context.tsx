import React, { useEffect, useRef, useState, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { Socket } from "./socketContext";
import { toast } from "react-toastify";

interface SocketProviderProps {
  children: ReactNode;
}

export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [shutdown, setShutdown] = useState(false);

  const peer = useRef(
    new RTCPeerConnection({
      iceServers: [
        {
          urls: [
            "stun:stun.l.google.com:19302",
            "stun:global.stun.twilio.com:3478",
          ],
        },
      ],
    })
  );
  // eslint-disable-next-line @typescript-eslint/no-explicit-any

  const navigate = useNavigate();

  const candidateQueue: RTCIceCandidateInit[] = [];
  let remoteDescSet = false;

  useEffect(() => {
    const socket = new WebSocket("ws://localhost:8080");

    setWs(socket);
    if (peer) {
      peer.current.onicecandidate = async (event) => {
        if (event?.candidate) {
          console.log("peer.oniceCandidate ", event?.candidate);
          socket?.send(
            JSON.stringify({
              type: "candidate",
              data: event.candidate,
              roomId: sessionStorage.getItem("roomId"),
            })
          );
        }
      };
    }

    console.log("peer is :", peer.current);

    socket.onmessage = (msg: MessageEvent) => {
      console.log(JSON.parse(msg.data));
      const { type, data, roomId } = JSON.parse(msg.data);

      if (type == "created") {
        sessionStorage.setItem("userType", "create");
        sessionStorage.setItem("roomId", roomId);
        toast.success(data);
        navigate("/videocall");
      }

      if (type == "joined") {
        sessionStorage.setItem("userType", "join");
        sessionStorage.setItem("roomId", roomId);
        toast.success(data);
        navigate("/videocall");
      }

      if (type == "ready") {
        if (sessionStorage.getItem("userType") == "create") {
          console.log(
            "Session Storage is : ",
            sessionStorage.getItem("userType")
          );
          async function offer() {
            const offer = await peer.current?.createOffer();
            await peer.current?.setLocalDescription(offer);
            socket.send(
              JSON.stringify({
                type: "offer",
                data: offer,
                roomId: sessionStorage.getItem("roomId"),
              })
            );
          }
          offer();
        }
      }

      if (type === "offer") {
        async function answer() {
          await peer.current?.setRemoteDescription(data);
          remoteDescSet = true;

          // Flush any candidates that came before setRemoteDescription
          candidateQueue.forEach((candidate) => {
            peer.current?.addIceCandidate(candidate);
          });
          candidateQueue.length = 0;

          const answer = await peer.current?.createAnswer();
          await peer.current?.setLocalDescription(answer);
          socket.send(
            JSON.stringify({
              type: "answer",
              data: answer,
              roomId: sessionStorage.getItem("roomId"),
            })
          );
        }
        answer();
      }

      if (type === "answer") {
        async function accept() {
          await peer.current?.setRemoteDescription(data);
          remoteDescSet = true;

          // Flush any queued candidates
          candidateQueue.forEach((candidate) => {
            peer.current?.addIceCandidate(candidate);
          });
          candidateQueue.length = 0;
        }
        accept();
      }

      if (type === "candidate") {
        async function addCandidate() {
          if (!remoteDescSet) {
            console.log("Queueing ICE candidate");
            candidateQueue.push(data);
          } else {
            console.log("Adding ICE candidate directly");
            await peer.current?.addIceCandidate(data);
          }
        }
        addCandidate();
      }

      if (type == "end") {
        setShutdown(true);
      }
    };

    // Optionally handle cleanup

    return () => {
      socket.close();
      sessionStorage.clear();
    };
  }, []);

  return (
    <Socket.Provider
      value={{
        ws,
        peer,
        shutdown,
        setShutdown,
      }}
    >
      {children}
    </Socket.Provider>
  );
};
