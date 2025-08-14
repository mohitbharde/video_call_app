import { useContext, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { Socket } from "@/context/socketContext";
import { toast } from "react-toastify";

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
    <div className="flex flex-col items-center justify-center h-screen gap-4 bg-gray-100">
      <button
        onClick={createRoom}
        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded"
      >
        Create Room
      </button>

      <div className="flex gap-2 flex-wrap items-center justify-center">
        <input
          type="text"
          placeholder="Enter room ID"
          value={roomIdInput}
          onChange={(e) => setRoomIdInput(e.target.value)}
          className="border border-gray-400 rounded px-4 py-2 w-64"
        />

        <button
          onClick={joinRoom}
          className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded"
        >
          Join Room
        </button>
      </div>
    </div>
  );
}

export default HomePage;
