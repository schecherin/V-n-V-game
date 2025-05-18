import React from 'react';
import { Users } from 'lucide-react';
import PlayerSlotHorizontal from './PlayerSlotHorizontal';
import { Player } from '@/lib/mockData';

interface PlayerListHorizontalProps {
  players: Player[];
  currentUserId: number;
  onPlayerClick: (player: Player) => void;
}

const PlayerListHorizontal: React.FC<PlayerListHorizontalProps> = ({ players, currentUserId, onPlayerClick }) => {
  return (
    <div className="py-4 px-2 bg-[var(--color-bg-cream)] border-b-2 border-[var(--color-border-gold)]/50">
      <h3 className="text-base font-semibold text-[var(--color-text-brown-dark)] mb-2 px-2">Players ({players.length})</h3>
      <div className="flex overflow-x-auto pb-3 space-x-1.5 scrollbar-thin scrollbar-thumb-[var(--color-border-gold)] scrollbar-track-[var(--color-bg-cream-light)]/50">
        {players.map(p => (<button key={p.id} onClick={() => onPlayerClick(p)} className="focus:outline-none focus:ring-2 focus:ring-[var(--color-accent-gold)] rounded-lg transition-transform active:scale-95"><PlayerSlotHorizontal player={p} isCurrentUser={p.id === currentUserId} /></button>))}
        <button className="flex-shrink-0 w-24 flex flex-col items-center justify-center p-2 mx-1.5 bg-[var(--color-bg-cream-light)]/70 rounded-lg border-2 border-dashed border-[var(--color-text-brown-medium)]/50 text-[var(--color-text-brown-medium)] hover:bg-[var(--color-bg-cream-light)] hover:border-[var(--color-border-gold)] hover:text-[var(--color-text-brown-dark)] cursor-pointer transition-all focus:outline-none focus:ring-2 focus:ring-[var(--color-accent-gold)] active:scale-95">
            <Users className="h-10 w-10 mb-1"/><span className="text-xs text-center font-medium">Invite</span>
        </button>
      </div>
    </div>
  );
};
export default PlayerListHorizontal;