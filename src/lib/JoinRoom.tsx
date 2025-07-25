import { useEffect, useRef } from "react";

function JoinRoom() {
  const videoRef = useRef<HTMLVideoElement>(null);

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
      } catch (err) {
        console.error("Error accessing media devices:", err);
      }
    }
    getMedia();
  }, []);

  return (
    <>
      <h1>Hello</h1>
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted // important to allow autoplay in most browsers
        style={{ width: "500px", height: "auto", backgroundColor: "black" }}
      ></video>
    </>
  );
}

export default JoinRoom;
