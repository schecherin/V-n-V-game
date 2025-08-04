import React from "react";
import { Users, MessageSquare } from "lucide-react";
import { ActiveView } from "@/app/[game_id]/layout";
import { GamePhase } from "@/types";

interface BottomNavBarProps {
  onToggleChat: () => void;
  onTogglePlayers: () => void;
  onToggleControls: () => void;
  onToggleGame: () => void;
  activeView: ActiveView;
  chatOpen: boolean;
  showControls: boolean;
  gamePhase: GamePhase;
}

const BottomNavBar: React.FC<BottomNavBarProps> = ({
  onToggleChat,
  onTogglePlayers,
  onToggleControls,
  onToggleGame,
  activeView,
  chatOpen,
  showControls,
  gamePhase,
}) => {
  const baseClass =
    "flex flex-initial w-24 items-center rounded-full border-2 gap-2 justify-center py-2 px-1 flex-1 transition-colors duration-150 focus:outline-none focus-visible:bg-[var(--color-border-gold)]/20";

  const iconColor = "text-cream-light";
  const activeIconColor = "text-accent-gold";

  const activeTextClass = "text-accent-gold font-semibold";
  const inactiveTextClass = `${iconColor} opacity-80 group-hover:opacity-100 group-hover:text-accent-gold`;

  return (
    <nav className="fixed bottom-0  left-0 right-0 z-30 flex items-center justify-evenly px-4 py-2 bg-brown-dark border-t-2 border-gold/50 shadow-lg">
      <button
        onClick={onTogglePlayers}
        className={`${baseClass} group  ${inactiveTextClass}`}
      >
        <Users
          size={22}
          className={`${iconColor} group-hover:text-accent-gold transition-colors`}
        />
        <span className="text-[11px] mt-0.5">Players</span>
      </button>
      <button
        onClick={onToggleChat}
        className={`${baseClass} group ${
          chatOpen ? activeTextClass : inactiveTextClass
        }`}
      >
        <MessageSquare
          size={22}
          className={`${
            chatOpen ? activeIconColor : iconColor
          } group-hover:text-accent-gold transition-colors`}
        />
        <span className="text-[11px] mt-0.5">Chat</span>
      </button>
    </nav>
  );
};
export default BottomNavBar;
