import React from 'react';
import { CheckCircle, Clock } from 'lucide-react';
import { Player } from '@/lib/mockData';

interface PlayerSlotHorizontalProps {
  player?: Player;
  isCurrentUser: boolean;
}

const PlayerSlotHorizontal: React.FC<PlayerSlotHorizontalProps> = ({ player, isCurrentUser }) => {
  if (!player) { return <div className="w-24 h-32" />; }

  const baseBorderColor: string = 'border-[var(--color-text-brown-medium)]/50';
  const readyBorderColor: string = 'border-[var(--color-accent-green)]';
  const hostBorderColor: string = 'border-[var(--color-accent-gold)]';
  let currentBorderColor: string = baseBorderColor;

  if (player.isHost) currentBorderColor = hostBorderColor;
  else if (player.isReady) currentBorderColor = readyBorderColor;

  const avatarBgColor = player.id % 2 === 0 ? 'bg-[var(--color-border-gold)]' : 'bg-[var(--color-bg-cream)]';
  const avatarTextColor = 'text-[var(--color-text-brown-dark)]';

  return (
    <div className={`flex-shrink-0 w-24 flex flex-col items-center p-2 mx-1.5 bg-[var(--color-bg-cream-light)] rounded-lg border-2 ${currentBorderColor} shadow-md`}>
      <div className="relative mb-1.5">
        <div
          className={`w-14 h-14 rounded-full border-2 border-[var(--color-border-gold)]/50 flex items-center justify-center ${avatarBgColor} ${avatarTextColor} text-xl font-semibold overflow-hidden`}
          aria-label={`Avatar for ${player.username}`}
        >
          P{player.id}
        </div>


        {player.isHost && <span className="absolute -top-1.5 -right-1.5 text-xl" title="Host">👑</span>}
        {!player.isHost && player.isReady && <CheckCircle className="absolute -top-1 -right-1 h-5 w-5 text-[var(--color-accent-green)] bg-[var(--color-bg-cream-light)] rounded-full p-0.5 shadow" />}
        {!player.isHost && !player.isReady && <Clock className="absolute -top-1 -right-1 h-5 w-5 text-[var(--color-accent-gold)] bg-[var(--color-bg-cream-light)] rounded-full p-0.5 shadow" />}
      </div>
      <span className="text-xs font-medium text-[var(--color-text-brown-dark)] truncate w-full text-center">{player.username}</span>
      {isCurrentUser && (<span className="text-[10px] text-[var(--color-accent-gold)] font-semibold">(You)</span>)}
    </div>
  );
};
export default PlayerSlotHorizontal;