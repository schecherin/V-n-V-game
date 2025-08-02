import React, { useState, useEffect } from "react";
import Button from "../ui/Button";
import { Game, GamePhase, Player } from "@/types";
import {
  recordVote,
  countVotes,
  setHostPlayerId,
  setSecretaryPlayerId,
  setTreasurerPlayerId,
} from "@/lib/gameApi";

interface ConsultationElectionsProps {
  game: Game | null;
  players: Player[];
  currentPlayer: Player | undefined;
  gameId: string;
  dayNumber: number;
  currentPhase: GamePhase;
  onNextPhase: () => void;
  isCurrentUserHost: boolean;
}

type ElectionRole = "chairperson" | "secretary";

interface ElectionState {
  currentRole: ElectionRole;
  candidates: Player[];
  hasVoted: boolean;
  electionComplete: boolean;
  electedPlayers: {
    chairperson?: Player;
    secretary?: Player;
    treasurer?: Player;
  };
}

const ConsultationElections: React.FC<ConsultationElectionsProps> = ({
  game,
  players,
  currentPlayer,
  gameId,
  dayNumber,
  currentPhase,
  onNextPhase,
  isCurrentUserHost,
}) => {
  const getCurrentRole = (phase: GamePhase): ElectionRole => {
    if (phase === "Elections_Chairperson") return "chairperson";
    return "secretary";
  };

  const [electionState, setElectionState] = useState<ElectionState>({
    currentRole: getCurrentRole(currentPhase),
    candidates: [],
    hasVoted: false,
    electionComplete: false,
    electedPlayers: {},
  });

  const [selectedCandidate, setSelectedCandidate] = useState<string | null>(
    null
  );
  const [loading, setLoading] = useState(false);

  // Get top 3 players by minigame rank
  const getTopPlayers = () => {
    return players
      .filter(
        (player) => player.last_mini_game_rank && player.last_mini_game_rank > 0
      )
      .sort(
        (a, b) => (a.last_mini_game_rank || 0) - (b.last_mini_game_rank || 0)
      )
      .slice(0, 3);
  };

  useEffect(() => {
    if (!game) {
      console.log("No game found");
      return;
    }

    console.log(`currentPhase received: ${currentPhase}`);
    const currentRole = getCurrentRole(currentPhase);
    console.log(`currentRole set: ${currentRole}`);

    // Update election state with current role and elected players
    setElectionState((prev) => {
      const newElectedPlayers = {
        chairperson:
          currentRole !== "chairperson"
            ? players.find((p) => p.player_id === game?.host_player_id)
            : undefined,
        secretary: players.find(
          (p) => p.player_id === game?.secretary_player_id
        ),
        treasurer: players.find(
          (p) => p.player_id === game?.treasurer_player_id
        ),
      };

      // Initialize candidates if needed
      let newCandidates = prev.candidates;
      if (prev.candidates.length === 0) {
        const topPlayers = getTopPlayers();
        if (topPlayers.length >= 3) {
          newCandidates = topPlayers;
        }
      } else {
        // Filter out chairperson from candidates if they were elected
        newCandidates = prev.candidates.filter(
          (c) => c.player_id !== newElectedPlayers.chairperson?.player_id
        );
      }

      return {
        ...prev,
        currentRole: currentRole,
        electedPlayers: newElectedPlayers,
        candidates: newCandidates,
        electionComplete: currentPhase === "Elections_Result",
      };
    });

    console.log(`electionState updated for phase: ${currentPhase}`);
  }, [currentPhase, game, players]);

  // Check if current player has already voted
  useEffect(() => {
    const checkVoteStatus = async () => {
      if (!currentPlayer) return;

      try {
        const hasVoted = await countVotes(
          gameId,
          dayNumber,
          currentPhase,
          electionState.currentRole,
          currentPlayer.player_id
        );
        setElectionState((prev) => ({
          ...prev,
          hasVoted: hasVoted !== null,
        }));
      } catch (error) {
        console.error("Failed to check vote status:", error);
      }
    };

    checkVoteStatus();
  }, [gameId, dayNumber, electionState.currentRole, currentPlayer]);

  const handleVote = async () => {
    if (!selectedCandidate || !currentPlayer) return;

    setLoading(true);
    try {
      await recordVote({
        gameId,
        voterId: currentPlayer.player_id,
        candidateId: selectedCandidate,
        dayNumber,
        gamePhase: currentPhase,
        electionRole: electionState.currentRole,
      });

      setElectionState((prev) => ({
        ...prev,
        hasVoted: true,
      }));

      setSelectedCandidate(null);
    } catch (error) {
      console.error("Failed to record vote:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleNextRole = async () => {
    try {
      // Get the winner from the database
      const winnerId = await countVotes(
        gameId,
        dayNumber,
        currentPhase,
        electionState.currentRole
      );

      if (!winnerId) {
        console.error("No votes found for", electionState.currentRole);
        return;
      }

      // Find the winner player object
      const winner = electionState.candidates.find(
        (candidate) => candidate.player_id === winnerId
      );

      if (!winner) {
        console.error("Winner not found in candidates");
        return;
      }

      // Update elected players
      setElectionState((prev) => ({
        ...prev,
        electedPlayers: {
          ...prev.electedPlayers,
          [prev.currentRole]: winner,
        },
      }));

      // Update database with elected player
      if (electionState.currentRole === "chairperson") {
        await setHostPlayerId(gameId, winnerId);
        setElectionState((prev) => ({
          ...prev,
          candidates: prev.candidates.filter(
            (candidate) => candidate.player_id !== winnerId
          ),
        }));
      } else if (electionState.currentRole === "secretary") {
        await setSecretaryPlayerId(gameId, winnerId);
        const thirdPlayer = electionState.candidates.find(
          (c) => c.player_id !== winnerId
        );
        if (thirdPlayer) {
          await setTreasurerPlayerId(gameId, thirdPlayer.player_id);
        }
      }
    } catch (error) {
      console.error("Failed to update elected player:", error);
    }

    onNextPhase();
  };

  const getRoleDisplayName = (role: ElectionRole) => {
    switch (role) {
      case "chairperson":
        return "Chairperson (Host)";
      case "secretary":
        return "Secretary";
      default:
        return "Treasurer";
    }
  };

  if (electionState.electionComplete) {
    return (
      <div className="bg-white rounded-xl shadow-2xl p-8 max-w-2xl mx-auto text-center border border-slate-300">
        <h2 className="text-2xl font-bold mb-6 text-slate-900">
          Election Results
        </h2>

        <div className="space-y-4 mb-8">
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <span className="text-lg font-semibold text-slate-700">
              Chairperson (Host)
            </span>
            <div className="text-xl font-bold text-blue-600 mt-2">
              {electionState.electedPlayers.chairperson?.player_name}
            </div>
          </div>

          <div className="bg-green-50 rounded-lg p-4 border border-green-200">
            <span className="text-lg font-semibold text-slate-700">
              Secretary
            </span>
            <div className="text-xl font-bold text-green-600 mt-2">
              {electionState.electedPlayers.secretary?.player_name}
            </div>
          </div>

          <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
            <span className="text-lg font-semibold text-slate-700">
              Treasurer
            </span>
            <div className="text-xl font-bold text-purple-600 mt-2">
              {electionState.electedPlayers.treasurer?.player_name}
            </div>
          </div>
        </div>

        {isCurrentUserHost && (
          <Button onClick={onNextPhase} className="w-full">
            Continue to Next Phase
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-2xl p-8 max-w-2xl mx-auto text-center border border-slate-300">
      {electionState.electedPlayers.chairperson && (
        <div className="border-2 rounded-lg p-4 mb-4">
          <h2 className="text-xl text-slate-900">
            Chairperson: {electionState.electedPlayers.chairperson.player_name}
          </h2>
        </div>
      )}

      <h2 className="text-2xl font-bold mb-6 text-slate-900">
        Election: {getRoleDisplayName(electionState.currentRole)}
      </h2>

      <p className="text-slate-600 mb-6">
        Vote for the player you want to be{" "}
        {getRoleDisplayName(electionState.currentRole).toLowerCase()}. Only the
        top 3 players from the minigame are eligible.
      </p>

      <div className="space-y-4 mb-8">
        {electionState.candidates.map((candidate, index) => (
          <button
            key={candidate.player_id}
            className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
              selectedCandidate === candidate.player_id
                ? "border-blue-500 bg-blue-50"
                : "border-slate-200 hover:border-slate-300"
            }`}
            onClick={() =>
              !electionState.hasVoted &&
              setSelectedCandidate(candidate.player_id)
            }
            disabled={electionState.hasVoted}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-amber-500 text-white rounded-full flex items-center justify-center font-bold">
                  {index + 1}
                </div>
                <span className="font-semibold text-slate-900">
                  {candidate.player_name}
                </span>
              </div>
            </div>
          </button>
        ))}
      </div>

      {!electionState.hasVoted ? (
        <Button
          onClick={handleVote}
          disabled={!selectedCandidate || loading}
          className="w-full mb-4"
        >
          {loading ? "Recording Vote..." : "Submit Vote"}
        </Button>
      ) : (
        <div className="text-green-600 font-semibold mb-4">✓ Vote recorded</div>
      )}

      {isCurrentUserHost && electionState.hasVoted && (
        <Button onClick={handleNextRole} className="w-full">
          {electionState.currentRole === "secretary"
            ? "Complete Election"
            : "Next Role"}
        </Button>
      )}

      {!isCurrentUserHost && electionState.hasVoted && (
        <div className="text-slate-600 italic">
          Waiting for the host to continue...
        </div>
      )}
    </div>
  );
};

export default ConsultationElections;
