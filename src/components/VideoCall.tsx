import MenuBar from "@/lib/menubar";
import { useContext, useEffect, useRef, useState } from "react";
import Chat from "./Chat";
import videoControl from "../lib/icons/videoControl.svg";
import videoOff from "../lib/icons/ControlItem Base.svg";
import muted from "../lib/icons/muted.svg";
import audioControl from "../lib/icons/audioControl.svg";
import screenShare from "../lib/icons/screenShare.svg";
import chat from "../lib/icons/chat.svg";
import leave from "../lib/icons/leave.svg";
import { Socket } from "@/context/socketContext";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import CopyClickBoard from "./CopyClickBoard";

const VideoCall = () => {
  const { peer, ws, shutdown, setShutdown } = useContext(Socket);
  const [isChatOpen, setIsChatOpen] = useState<boolean>(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const remoteVideo = useRef<HTMLVideoElement>(null);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [video, setVideo] = useState<MediaStreamTrack | null>(null);
  const [audio, setAudio] = useState<MediaStreamTrack | null>(null);
  const [videoIcon, setVideoIcon] = useState<string>(videoControl);
  const [audioIcon, setAudioIcon] = useState<string>(audioControl);
  const navigate = useNavigate();

  function endCall() {
    if (shutdown) {
      console.log("local stream : ", localStream);
      localStream?.getTracks().forEach((track) => track.stop());
      remoteVideo.current = null;
      toast.success("the call has been ended ");
      setShutdown(false);
      navigate("/");
    }
  }

  const iconArray = [
    {
      icon: videoIcon,
      text: "Cam",
      onclick: () => {
        if (video) {
          video.enabled = !video.enabled;
          if (videoIcon == videoControl) setVideoIcon(videoOff);
          else setVideoIcon(videoControl);
        }
      },
    },
    {
      icon: audioIcon,
      text: "Mic",
      onclick: () => {
        if (audio) {
          audio.enabled = !audio.enabled;
          if (audioIcon == audioControl) setAudioIcon(muted);
          else setAudioIcon(audioControl);
        }
      },
    },
    {
      icon: screenShare,
      text: "Share",
      onclick: async () => {
        try {
          const display = await navigator.mediaDevices.getDisplayMedia({
            video: true,
            audio: false,
          });

          // Replace the video track in the peer connection
          const videoSender = peer.current
            .getSenders()
            .find((s) => s.track?.kind === "video");
          if (videoSender) {
            videoSender.replaceTrack(display.getVideoTracks()[0]);
          }

          // Update local video element to show the screen
          if (videoRef.current) {
            videoRef.current.srcObject = display;
          }

          // Listen for when the user stops sharing the screen
          display.getVideoTracks()[0].onended = () => {
            // revert back to webcam video track
            if (videoSender && video) {
              videoSender.replaceTrack(video);
              if (videoRef.current) {
                // revert local video element to webcam stream
                videoRef.current.srcObject = new MediaStream(
                  [video, audio].filter(Boolean)
                );
              }
            }
          };

          // Notify other peers if you want
        } catch (error) {
          toast.error("Error sharing screen:", error);
        }
      },
    },

    { icon: chat, text: "Chat", onclick: () => setIsChatOpen((pre) => !pre) },
    {
      icon: leave,
      text: "Leave",
      onclick: () => {
        ws.send(
          JSON.stringify({
            type: "end",
            data: " End the call",
            roomId: sessionStorage.getItem("roomId"),
          })
        );
      },
    },
  ];

  useEffect(() => {
    async function getMedia() {
      try {
        const media = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        console.log("this is the stream that i am going to send : ", media);
        setLocalStream(media);
        setVideo(media.getVideoTracks()[0]);
        setAudio(media.getAudioTracks()[0]);
        if (videoRef.current) {
          videoRef.current.srcObject = media;
        }
        console.log("video reff value: ", localStream);
        media
          .getTracks()
          .forEach((track) => peer.current?.addTrack(track, media));
      } catch (err) {
        toast.error("Error accessing media devices:", err);
      }
    }
    getMedia();

    if (peer.current) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      peer.current.ontrack = (event: { streams: [any] }) => {
        const [remoteStream] = event.streams;
        console.log("event object : ", event.streams);
        if (remoteVideo.current) {
          remoteVideo.current.srcObject = remoteStream;
        }
      };
    }

    return () => {
      videoRef.current = null;
      remoteVideo.current = null;
    };
  }, []);

  useEffect(() => {
    endCall();
  }, [shutdown]);

  return (
    <div className="w-screen h-screen flex relative ">
      <div
        className={` h-screen bg-gray-800 flex flex-col justify-between transform transition-transform duration-300 ease-in-out items-center p-4 ${
          isChatOpen ? "hidden md:flex md:w-[calc(100vw-384px)]" : "w-full"
        } `}
      >
        {/* Video Grid */}
        <div className="flex flex-col md:flex-row gap-4 justify-center items-center w-full h-full max-h-[85%]">
          {/* Video 1 */}
          <div className="w-full md:w-1/2 h-[45%] md:h-full">
            <video
              ref={videoRef}
              className="w-full h-full object-cover rounded-lg"
              autoPlay
              playsInline
              muted
            />
          </div>

          {/* Video 2 */}
          <div className=" w-full md:w-1/2 h-[45%] md:h-full">
            <video
              ref={remoteVideo}
              className="w-full h-full object-cover rounded-lg"
              autoPlay
              playsInline
            />
          </div>
        </div>
        <MenuBar iconArray={iconArray} />
      </div>
      <Chat isopen={isChatOpen} setIsOpen={setIsChatOpen} />
      <CopyClickBoard />
    </div>
  );
};

export default VideoCall;
