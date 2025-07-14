import React, { useState, useEffect, useRef } from 'react';
import { X, Heart, Flame, Smile, ThumbsUp } from 'lucide-react';
import Button from "@/components/ui/Button";

interface ChatPanelProps {
  isOpen: boolean;
  onClose: () => void;
}
interface ChatMessage {
    user: string;
    text: string;
}

const ChatPanel: React.FC<ChatPanelProps> = ({ isOpen, onClose }) => {
  const emotes = [ { name: "Heart", char: "❤️" }, { name: "Flame", char: "🔥" }, { name: "Smile", char: "😊" }, { name: "ThumbsUp", char: "👍" }, { name: "Evil", char: "😈" }, { name: "Angel", char: "😇" } ];
  const [message, setMessage] = useState<string>("");
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([ {user: "System", text: "Welcome to Vice and Virtue - Test"}, {user: "Player 3", text: " ...."}, ]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollToBottom = (): void => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); };
  useEffect(scrollToBottom, [chatMessages]);
  const handleSend = (): void => { if (message.trim()) { setChatMessages([...chatMessages, {user: "You", text: message}]); setMessage(""); } }
  const handleEmoteSend = (emoteChar: string): void => { setChatMessages([...chatMessages, {user: "You", text: emoteChar}]); }

  return (
    <div
        className={`fixed inset-x-0 z-40 flex flex-col 
                   bg-[var(--color-bg-cream)] 
                   border-t-2 border-[var(--color-border-gold)] 
                   shadow-[0_-5px_15px_-3px_rgba(0,0,0,0.1)]
                   transition-all duration-300 ease-in-out 
                   h-[60vh] 
                   ${isOpen 
                     ? 'bottom-16 translate-y-0 opacity-100' 
                     : 'bottom-0 translate-y-full opacity-0 pointer-events-none' 
                   }`}
    >
      <div className="flex items-center justify-between p-3 border-b-2 border-[var(--color-border-gold)] bg-[var(--color-bg-cream-light)] shadow-sm">
        <h3 className="text-md font-semibold text-[var(--color-text-brown-dark)]">Lobby Chat</h3>
        <Button variant="ghost" size="icon" onClick={onClose} className="text-[var(--color-text-brown-dark)] hover:bg-[var(--color-border-gold)]/30">
          <X className="h-6 w-6" />
        </Button>
      </div>
      <div className="flex-grow p-3 space-y-2.5 overflow-y-auto bg-[var(--color-bg-cream)]">
        {chatMessages.map((msg, index) => (
          <div key={index} className={`text-sm py-1.5 px-2.5 rounded-lg shadow-sm max-w-[85%] break-words ${msg.user === "You" ? 'bg-[var(--color-accent-gold)]/30 ml-auto text-right' : (msg.user === "System" ? 'bg-[var(--color-text-brown-medium)]/20 text-center w-full max-w-full' : 'bg-[var(--color-bg-cream-light)] border border-[var(--color-border-gold)]/50 mr-auto')}`}>
            {msg.user !== "System" && <span className={`font-semibold text-xs ${msg.user === "You" ? 'text-[var(--color-accent-gold)]' : 'text-[var(--color-text-brown-medium)]'}`}>{msg.user}: </span>}
            <span className="text-[var(--color-text-brown-dark)]">{msg.text}</span>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <div className="p-2 border-t border-[var(--color-border-gold)]/50 bg-[var(--color-text-brown-dark)] grid grid-cols-6 gap-1">
        {emotes.map(emote => (
          <Button key={emote.name} variant="ghost" size="sm" onClick={() => handleEmoteSend(emote.char)} className="text-2xl p-1 aspect-square text-[var(--color-bg-cream-light)] hover:bg-[var(--color-border-gold)]/40">
            {emote.char}
          </Button>
        ))}
      </div>
      <div className="p-3 border-t-2 border-[var(--color-border-gold)]/70 bg-[var(--color-text-brown-dark)] flex items-center space-x-2">
        <input
          type="text"
          value={message}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setMessage(e.target.value)}
          placeholder="Type a message..."
          className="flex-grow p-2.5 rounded-md border border-[var(--color-border-gold)] focus:ring-2 focus:ring-[var(--color-accent-gold)] focus:border-[var(--color-accent-gold)] bg-[var(--color-bg-cream)] text-[var(--color-text-brown-dark)] placeholder-[var(--color-text-brown-medium)]"
          onKeyPress={(e: React.KeyboardEvent<HTMLInputElement>) => e.key === 'Enter' && handleSend()}
        />
        <Button onClick={handleSend} variant="default" size="default" className="font-semibold px-5">Send</Button>
      </div>
    </div>
  );
};
export default ChatPanel;