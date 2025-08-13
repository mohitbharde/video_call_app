import { useContext, useEffect, useRef, useState } from "react";
import { Button } from "./ui/button";
import { Socket } from "@/context/socketContext";
import { Textarea } from "./ui/textarea";

type chatProp = {
  senderType: "receive" | "send";
  msg: string;
};

export default function Chat({ isopen, setIsOpen }) {
  const { peer } = useContext(Socket);
  const [chat, setChat] = useState<chatProp[]>([]);
  const [msg, setMsg] = useState("");
  const dataChannel = useRef<RTCDataChannel | null>(null);

  function sendMsg() {
    dataChannel.current?.send(
      JSON.stringify({
        senderType: "send",
        msg: msg,
      })
    );
    if (msg) {
      setChat((prev) => [
        ...prev,
        {
          senderType: "send",
          msg: msg,
        },
      ]);

      setMsg("");
    }
  }

  useEffect(() => {
    try {
      if (sessionStorage.getItem("userType") == "create") {
        dataChannel.current = peer.current.createDataChannel("chat", {
          ordered: true,
        });
        if (dataChannel.current) {
          dataChannel.current.onopen = () => {
            console.log("Data channel is open");
          };

          dataChannel.current.onmessage = (event) => {
            const data = JSON.parse(event.data);
            const msg = data.msg;
            console.log("Message:", msg);
            setChat((prev) => [
              ...prev,
              {
                senderType: "receive",
                msg: msg,
              },
            ]);
          };
        }
        console.log("i am creater : ", dataChannel.current);
      } else {
        peer.current.ondatachannel = (event) => {
          dataChannel.current = event.channel;
          const dataC = event.channel;

          dataC.onopen = () => {
            console.log("Data channel is open");
          };

          dataC.onclose = () => {
            console.log("Data channel is closed");
          };

          dataC.onmessage = (event) => {
            const data = JSON.parse(event.data);
            const msg = data.msg;
            console.log("Message:", msg);
            setChat((prev) => [
              ...prev,
              {
                senderType: "receive",
                msg: msg,
              },
            ]);
          };
        };
      }
    } catch (e) {
      console.error("Error in chat:", e);
    }
  }, []);

  return (
    <div
      className={` ${
        isopen ? "w-full  md:w-[384px]" : "hidden"
      }   box-border border rounded-lg shadow-md flex flex-col h-[100vh] transform transition-transform duration-300 ease-in-out `}
    >
      {/* Header */}
      <div className="px-4 py-2 border-b flex justify-between items-center">
        <h2 className="font-semibold text-lg">Chat</h2>
        <button
          className="text-xl font-bold"
          onClick={() => setIsOpen((perv: boolean) => !perv)}
        >
          &times;
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-white">
        {chat?.map((ele) => {
          return (
            <div
              className={`${
                ele.senderType == "send" ? " flex-row-reverse " : " flex-row"
              } w-full flex flex-wrap text-wrap`}
            >
              <div
                className={`break-words whitespace-pre-wrap ${
                  ele.senderType == "send" ? "bg-blue-400" : "bg-amber-300"
                } max-w-[80%] w-fit p-2 m-2 rounded-2xl h-auto`}
              >
                {ele.msg}
              </div>
            </div>
          );
        })}
      </div>

      {/* Input */}
      <div className="p-2 border-t gap-1 flex items-end">
        <Textarea
          placeholder="Type here..."
          value={msg}
          onChange={(e) => setMsg(e.target.value)}
        />
        <Button variant={"default"} size={"default"} onClick={() => sendMsg()}>
          Send
        </Button>
      </div>
    </div>
  );
}
