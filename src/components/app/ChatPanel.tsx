import React, { useState, useEffect, useRef } from "react";
import { X, Heart, Flame, Smile, ThumbsUp } from "lucide-react";
import Button from "@/components/ui/button";

interface ChatPanelProps {
  isOpen: boolean;
  onClose: () => void;
}
interface ChatMessage {
  user: string;
  text: string;
}

const ChatPanel: React.FC<ChatPanelProps> = ({ isOpen, onClose }) => {
  const emotes = [
    { name: "Heart", char: "❤️" },
    { name: "Flame", char: "🔥" },
    { name: "Smile", char: "😊" },
    { name: "ThumbsUp", char: "👍" },
    { name: "Evil", char: "😈" },
    { name: "Angel", char: "😇" },
  ];
  const [message, setMessage] = useState<string>("");
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    { user: "System", text: "Welcome to Vice and Virtue - Test" },
    { user: "Player 3", text: " ...." },
  ]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollToBottom = (): void => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  useEffect(scrollToBottom, [chatMessages]);
  const handleSend = (): void => {
    if (message.trim()) {
      setChatMessages([...chatMessages, { user: "You", text: message }]);
      setMessage("");
    }
  };
  const handleEmoteSend = (emoteChar: string): void => {
    setChatMessages([...chatMessages, { user: "You", text: emoteChar }]);
  };

  return (
    <div
      className={`fixed inset-x-0 z-40 flex flex-col 
                   bg-cream 
                   border-t-2 border-gold 
                   shadow-[0_-5px_15px_-3px_rgba(0,0,0,0.1)]
                   transition-all duration-300 ease-in-out 
                   h-[60vh] 
                   ${
                     isOpen
                       ? "bottom-16 translate-y-0 opacity-100"
                       : "bottom-0 translate-y-full opacity-0 pointer-events-none"
                   }`}
    >
      <div className="flex items-center justify-between p-3 border-b-2 border-gold bg-cream-light shadow-sm">
        <h3 className="text-md font-semibold text-brown-dark">Lobby Chat</h3>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="text-brown-dark hover:bg-gold/30"
        >
          <X className="h-6 w-6" />
        </Button>
      </div>
      <div className="flex-grow p-3 space-y-2.5 overflow-y-auto bg-cream">
        {chatMessages.map((msg, index) => (
          <div
            key={index}
            className={`text-sm py-1.5 px-2.5 rounded-lg shadow-sm max-w-[85%] break-words ${
              msg.user === "You"
                ? "bg-accent-gold/30 ml-auto text-right"
                : msg.user === "System"
                ? "bg-brown-medium/20 text-center w-full max-w-full"
                : "bg-cream-light border border-gold/50 mr-auto"
            }`}
          >
            {msg.user !== "System" && (
              <span
                className={`font-semibold text-xs ${
                  msg.user === "You" ? "text-accent-gold" : "text-brown-medium"
                }`}
              >
                {msg.user}:{" "}
              </span>
            )}
            <span className="text-brown-dark">{msg.text}</span>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <div className="p-2 border-t border-gold/50 bg-brown-dark grid grid-cols-6 gap-1">
        {emotes.map((emote) => (
          <Button
            key={emote.name}
            variant="ghost"
            size="sm"
            onClick={() => handleEmoteSend(emote.char)}
            className="text-2xl p-1 aspect-square text-cream-light hover:bg-gold/40"
          >
            {emote.char}
          </Button>
        ))}
      </div>
      <div className="p-3 border-t-2 border-gold/70 bg-brown-dark flex items-center space-x-2">
        <input
          type="text"
          value={message}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setMessage(e.target.value)
          }
          placeholder="Type a message..."
          className="flex-grow p-2.5 rounded-md border border-gold focus:ring-2 focus:ring-accent-gold focus:border-accent-gold bg-cream text-brown-dark placeholder-brown-medium"
          onKeyPress={(e: React.KeyboardEvent<HTMLInputElement>) =>
            e.key === "Enter" && handleSend()
          }
        />
        <Button
          onClick={handleSend}
          variant="default"
          size="default"
          className="font-semibold px-5"
        >
          Send
        </Button>
      </div>
    </div>
  );
};
export default ChatPanel;
