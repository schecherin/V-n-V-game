
import React from 'react';
import { Users, MessageSquare, Settings } from 'lucide-react';
import { ActiveView } from '@/lib/mockData';

interface BottomNavBarProps {
    onToggleChat: () => void;
    onTogglePlayers: () => void;
    onToggleControls: () => void;
    activeView: ActiveView;
    chatOpen: boolean;
}

const BottomNavBar: React.FC<BottomNavBarProps> = ({ onToggleChat, onTogglePlayers, onToggleControls, activeView, chatOpen }) => {
  const baseClass = "flex flex-col items-center justify-center py-2 px-1 flex-1 transition-colors duration-150 focus:outline-none focus-visible:bg-[var(--color-border-gold)]/20";
  
  const iconColor = "text-cream-light"; 
  const activeIconColor = "text-accent-gold";
  
  const activeTextClass = "text-accent-gold font-semibold";
  const inactiveTextClass = `${iconColor} opacity-80 group-hover:opacity-100 group-hover:text-accent-gold`;

  return (
    <nav 
      className="fixed bottom-0 left-0 right-0 z-30 flex items-center justify-between px-4 py-2 bg-brown-dark border-t-2 border-gold/50 shadow-lg"
    >
      <button onClick={onTogglePlayers} className={`${baseClass} group ${activeView === 'players' && !chatOpen ? activeTextClass : inactiveTextClass}`}>
        <Users size={22} className={`${activeView === 'players' && !chatOpen ? activeIconColor : iconColor} group-hover:text-accent-gold transition-colors`} />
        <span className="text-[11px] mt-0.5">Players</span>
      </button>
      <button onClick={onToggleChat} className={`${baseClass} group ${chatOpen ? activeTextClass : inactiveTextClass}`}>
        <MessageSquare size={22} className={`${chatOpen ? activeIconColor : iconColor} group-hover:text-accent-gold transition-colors`} />
        <span className="text-[11px] mt-0.5">Chat</span>
      </button>
      <button onClick={onToggleControls} className={`${baseClass} group ${activeView === 'controls' && !chatOpen ? activeTextClass : inactiveTextClass}`}>
        <Settings size={22} className={`${activeView === 'controls' && !chatOpen ? activeIconColor : iconColor} group-hover:text-accent-gold transition-colors`} />
        <span className="text-[11px] mt-0.5">Controls</span>
      </button>
    </nav>
  );
};
export default BottomNavBar;