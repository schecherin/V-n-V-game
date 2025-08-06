import React from "react";
import { Users } from "lucide-react";
import PlayerSlotHorizontal from "./PlayerSlotHorizontal";
import { Player } from "@/types";
import { useGameContext } from "@/app/[game_id]/layout";

interface PlayerListHorizontalProps {
  onPlayerClick: (player: Player) => void;
}

const PlayerListHorizontal: React.FC<PlayerListHorizontalProps> = ({
  onPlayerClick,
}) => {
  const { players, currentPlayerIsHost, playerId } = useGameContext();
  const handleInvite = async () => {
    // TODO: Implement invite functionality
  };

  return (
    <div className="py-4 px-2 bg-cream border-b-2 border-gold/50">
      <h3 className="text-base font-semibold text-brown-dark mb-2 px-2">
        Players ({players.length})
      </h3>
      <div className="flex overflow-x-auto pb-3 space-x-1.5 scrollbar-thin scrollbar-thumb-gold scrollbar-track-cream-light/50">
        {players.map((p) => (
          <button
            key={p.player_id}
            onClick={() => onPlayerClick(p)}
            className="focus:outline-none focus:ring-2 focus:ring-accent-gold rounded-lg transition-transform active:scale-95"
          >
            <PlayerSlotHorizontal
              player={p}
              isCurrentUser={p.player_id === playerId}
              isHost={currentPlayerIsHost}
            />
          </button>
        ))}
        <button
          onClick={handleInvite}
          className="flex-shrink-0 w-24 flex flex-col items-center justify-center p-2 mx-1.5 bg-cream-light/70 rounded-lg border-2 border-dashed border-brown-medium/50 text-brown-medium hover:bg-cream-light hover:border-gold hover:text-brown-dark cursor-pointer transition-all focus:outline-none focus:ring-2 focus:ring-accent-gold active:scale-95"
        >
          <Users className="h-10 w-10 mb-1" />
          <span className="text-xs text-center font-medium">Invite</span>
        </button>
      </div>
    </div>
  );
};
export default PlayerListHorizontal;
