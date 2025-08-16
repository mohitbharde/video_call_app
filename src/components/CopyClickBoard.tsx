import { useState } from "react";
import { Copy } from "lucide-react"; // icon library (npm install lucide-react)
import { Button } from "./ui/button";
import { toast } from "react-toastify";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export default function CopyClickBoard() {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const roomId = sessionStorage.getItem("roomId");
    if (!roomId) {
      toast.error("No room ID found in sessionStorage!");
      return;
    }

    try {
      await navigator.clipboard.writeText(roomId);
      toast.success("copied room id to click board : ");
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy: ", err);
      console.log("value of copied : ", copied);
    }
  };

  return (
    <div className="absolute left-1 bottom-8 md:left-3">
      <Tooltip>
        <TooltipTrigger>
          <Button onClick={handleCopy} size={"icon"} variant={"secondary"}>
            <Copy size={18} />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Copy roomId</p>
        </TooltipContent>
      </Tooltip>
    </div>
  );
}
