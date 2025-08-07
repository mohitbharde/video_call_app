import "./App.css";
import { useContext, useEffect, useRef } from "react";
import peerObj from "./Webrtc/peer";
import { Socket } from "./context/context";

function App() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const remoteVideo = useRef<HTMLVideoElement>(null);
  const socket = useContext(Socket);

  const peer = useRef(peerObj);

  useEffect(() => {
    async function getMedia() {
      try {
        const media = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        if (videoRef.current) {
          videoRef.current.srcObject = media;
        }
        media
          .getTracks()
          .forEach((track) => peer.current.peer?.addTrack(track, media));
      } catch (err) {
        console.error("Error accessing media devices:", err);
      }
    }
    getMedia();
  }, []);

  async function getData() {
    console.log("current  description: ", peer.current.peer);
  }

  async function offerHandler() {
    const offer = await peer.current.peer?.createOffer();
    await peer.current.peer?.setLocalDescription(offer);
    socket?.send(JSON.stringify(offer));

    peer.current.peer?.addEventListener("icecandidate", (event) => {
      if (event.candidate) {
        socket?.send(JSON.stringify(event.candidate));
        console.log("inside icecandidate ",event.candidate);
      }
    });

    console.log("inside offerHandler ");
  }

  useEffect(() => {
    if (!socket) return;

    socket.onmessage = (msg) => {
      // console.log("on message data: ", msg.data);

      const data = JSON.parse(msg.data);

      if (data.type == "offer") {
        async function answerHandler(data: RTCSessionDescriptionInit) {
          await peer.current.peer?.setRemoteDescription(
            new RTCSessionDescription(data)
          );
          const answer = await peer.current.peer?.createAnswer();
          await peer.current.peer?.setLocalDescription(answer);
          peer.current.peer?.addEventListener("icecandidate", (event) => {
            if (event.candidate) {
              socket?.send(JSON.stringify(event.candidate));
              console.log("inside icecandidate ",event.candidate);
            }
          });
          socket?.send(JSON.stringify(answer));
        }
        answerHandler(data);
      }

      if (data.type == "answer") {
        async function acceptAnswer(data: RTCSessionDescriptionInit) {
          await peer.current.peer?.setRemoteDescription(
            new RTCSessionDescription(data)
          );
        }
        acceptAnswer(data);
      }

      if (data.candidate) {
        async function addCandidate() {
          await peer.current.peer?.addIceCandidate(data);
          console.log("adding the candidate inside addCandidate");
        }
        addCandidate();
      }

      getData();
    };

    if (peer.current.peer) {
      peer.current.peer.ontrack = (event) => {
        const [remoteStream] = event.streams;
        if (remoteVideo.current) {
          remoteVideo.current.srcObject = remoteStream;
        }
        console.log("event.stream :", remoteStream);
      };
    }

    return () => {
      socket.onmessage = null;
    };
  }, [socket, socket?.onmessage]);

  return (
    <>
      {/* <form>
        <label htmlFor="message">Message</label>
        <input
          type="text"
          name="message"
          id="message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <button>Submit</button>
      </form> */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        style={{ width: "640px", height: "480px", border: "1px solid #ccc" }}
      />
      <button onClick={offerHandler}>Create offer</button>

      <video
        ref={remoteVideo}
        autoPlay
        playsInline
        muted
        style={{ width: "640px", height: "480px", border: "1px solid #ccc" }}
      ></video>
    </>
  );
}

export default App;
