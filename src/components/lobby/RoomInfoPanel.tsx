import React, { useState } from "react";
import { Copy, Share2 } from "lucide-react";
import Button from "@/components/ui/button";

interface RoomInfoPanelProps {
  roomName: string;
}

const RoomInfoPanel: React.FC<RoomInfoPanelProps> = ({ roomName }) => {
  const [copiedTimeout, setCopiedTimeout] = useState<NodeJS.Timeout | null>(
    null
  );

  const handleCopy = async (
    textToCopy: string,
    type: "name" | "link" | "link-fallback"
  ): Promise<void> => {
    if (copiedTimeout) clearTimeout(copiedTimeout);
    try {
      await navigator.clipboard.writeText(textToCopy);
      const originalButtonText = type === "name" ? "Copy Name" : "Share Link";
      const button = document.getElementById(
        `button-${type === "link-fallback" ? "link" : type}`
      ) as HTMLButtonElement | null;
      if (button) button.innerText = "Copied!";
      const timeoutId = setTimeout(() => {
        if (button) button.innerText = originalButtonText;
      }, 2000);
      setCopiedTimeout(timeoutId);
    } catch (err) {
      console.error(`Failed to copy ${type}: `, err);
      alert(`Failed to copy ${type}.`);
    }
  };

  const handleShare = async (): Promise<void> => {
    const shareData = {
      title: "Join my Vice & Virtue Lobby!",
      text: `Join my game lobby: ${roomName}`,
      url: window.location.href,
    };
    if (
      navigator.share &&
      navigator.canShare &&
      navigator.canShare(shareData)
    ) {
      try {
        await navigator.share(shareData);
      } catch (error: any) {
        console.error("Error sharing:", error);
        if (error.name !== "AbortError") {
          handleCopy(window.location.href, "link-fallback");
        }
      }
    } else {
      handleCopy(window.location.href, "link");
    }
  };

  return (
    <div className="p-4 bg-cream border-b-2 border-gold/50 flex flex-col items-center">
      <h2 className="text-xl font-semibold text-brown-dark text-center mb-4">
        "{roomName}"
      </h2>
      <div className="flex flex-col space-y-3 w-full max-w-xs">
        <Button
          id="button-name"
          onClick={() => handleCopy(roomName, "name")}
          variant="creamOutlineGold"
          size="default"
          className="w-full text-sm font-semibold"
        >
          <Copy size={16} className="mr-2" /> Copy Name
        </Button>
        <Button
          id="button-link"
          onClick={handleShare}
          variant="creamOutlineGold"
          size="default"
          className="w-full text-sm font-semibold"
        >
          <Share2 size={16} className="mr-2" /> Share Link
        </Button>
      </div>
    </div>
  );
};
export default RoomInfoPanel;
