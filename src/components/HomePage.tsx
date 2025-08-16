import { useContext, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { Socket } from "@/context/socketContext";
import { toast } from "react-toastify";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import CarouselForHomePage from "./CarouselForHomePage";

function HomePage() {
  const [roomIdInput, setRoomIdInput] = useState("");
  const socketContext = useContext(Socket);
  if (!socketContext) {
    throw new Error("Socket context is not available");
  }
  const { ws } = socketContext;
  const createRoom = () => {
    const newRoomId = uuidv4();
    toast.success(`Room created with ID: ${newRoomId}`);
    // You can also setRoomIdInput(newRoomId); if you want to auto-fill it
    ws?.send(
      JSON.stringify({
        type: "create",
        roomId: newRoomId,
      })
    );
  };

  const joinRoom = () => {
    if (!roomIdInput.trim()) {
      toast.warn("Please enter a room ID");
      return;
    }
    toast.success(`Joining room with ID: ${roomIdInput}`);
    ws?.send(
      JSON.stringify({
        type: "join",
        roomId: roomIdInput.trim(),
      })
    );
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4 my-12 bg-gray-100">
      <div className="w-full md:w-1/2 h-full flex flex-col items-center justify-center gap-4">
        <div className="max-w-5xl text-center text-wrap">
          <div className="text-5xl text-center mb-3.5">
            Secure Video Conferencing for everyone
          </div>
          <div className="text-3xl font-light mt-3.5">
            Connect , Collaborate and celebrate from anywhere
          </div>
        </div>

        <div className="flex flex-row gap-2 max-w-6xl w-full flex-wrap justify-center my-7">
          <Button onClick={createRoom} variant={"default"}>
            Create Room
          </Button>
          <span className="w-52 ">
            <Input
              type="text"
              placeholder="Enter room ID"
              value={roomIdInput}
              onChange={(e) => setRoomIdInput(e.target.value)}
            />
          </span>

          <Button
            onClick={joinRoom}
            variant={"secondary"}
            disabled={roomIdInput.length == 0}
          >
            Join Room
          </Button>
        </div>

        <div className="w-[90%] h-0.5 bg-slate-700"></div>
        <CarouselForHomePage />
      </div>
    </div>
  );
}

export default HomePage;
