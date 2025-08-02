import { useState } from "react";
import Button from "../ui/Button";
import { recordVote } from "@/lib/gameApi";
import { useGameContext } from "@/app/[game_id]/layout";

interface ConsultationVotingProps {
  onNextPhase: () => void;
}

const ConsultationVoting = ({ onNextPhase }: ConsultationVotingProps) => {
  const { game, players, playerId, currentPlayerIsHost } = useGameContext();
  const player = players.find((p) => p.player_id === playerId);

  const [hasVoted, setHasVoted] = useState(false);
  const [votingComplete, setVotingComplete] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleVote = () => {
    setLoading(true);
    if (!player || !selectedPlayer || !game) return;
    recordVote({
      gameId: game.game_code,
      voterId: player.player_id,
      candidateId: selectedPlayer,
      dayNumber: game.current_day,
      gamePhase: game.current_phase,
      electionRole: "prison",
    });
    setHasVoted(true);
    setLoading(false);
  };

  const completeVoting = () => {
    setVotingComplete(true);
    onNextPhase();
  };

  return (
    <div className="bg-white rounded-xl shadow-2xl p-8 max-w-2xl mx-auto text-center border border-slate-300">
      <h2 className="text-2xl font-bold mb-6 text-slate-900">Voting</h2>

      <p className="text-slate-600 mb-6">
        Vote for the player you want to be imprisoned.
      </p>

      <div className="space-y-4 mb-8">
        {players.map((player, index) => (
          <button
            key={player.player_id}
            className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
              selectedPlayer === player.player_id
                ? "border-blue-500 bg-blue-50"
                : "border-slate-200 hover:border-slate-300"
            }`}
            onClick={() => !hasVoted && setSelectedPlayer(player.player_id)}
            disabled={hasVoted}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-amber-500 text-white rounded-full flex items-center justify-center font-bold">
                  {index + 1}
                </div>
                <span className="font-semibold text-slate-900">
                  {player.player_name}
                </span>
              </div>
            </div>
          </button>
        ))}
      </div>

      {!hasVoted ? (
        <Button
          onClick={handleVote}
          disabled={!selectedPlayer}
          className="w-full mb-4"
        >
          {loading ? "Recording Vote..." : "Submit Vote"}
        </Button>
      ) : (
        <div className="text-green-600 font-semibold mb-4">✓ Vote recorded</div>
      )}

      {currentPlayerIsHost && hasVoted && (
        <Button onClick={completeVoting} className="w-full">
          Complete Voting
        </Button>
      )}

      {!currentPlayerIsHost && hasVoted && (
        <div className="text-slate-600 italic">
          Waiting for the host to continue...
        </div>
      )}
    </div>
  );
};
export default ConsultationVoting;
