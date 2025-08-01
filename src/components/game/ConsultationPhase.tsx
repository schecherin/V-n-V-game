import React, { useState } from "react";
import Button from "../ui/Button";
import { Player } from "@/types";

interface ConsultationPhaseProps {
  player?: Player;
  players: Player[];
  onNextPhase: () => void;
  onEndGame: () => void;
}

const ConsultationPhase = ({
  player,
  players,
  onNextPhase,
  onEndGame,
}: ConsultationPhaseProps) => {
  const [voting, setVoting] = useState<boolean>(false);
  const [vote, setVote] = useState<string | null>(null);
  const [voteSubmitted, setVoteSubmitted] = useState<boolean>(false);
  return (
    <>
      {voting ? (
        <div>
          <div className="flex flex-col items-center justify-center gap-4">
            <h2 className="text-xl font-semibold mb-2">Cast Your Vote</h2>
            <div className="w-full max-w-xs">
              <label
                htmlFor="player-vote-select"
                className="block mb-1 text-slate-700 font-medium"
              >
                Select a player to vote for:
              </label>
              <select
                id="player-vote-select"
                className="w-full p-2 rounded-md border border-slate-400 focus:ring-2 focus:ring-green-400"
                value={vote ?? ""}
                onChange={(e) => setVote(e.target.value)}
              >
                <option value="" disabled>
                  -- Choose a player --
                </option>
                {players.map((p) => (
                  <option key={p.player_id} value={p.player_id}>
                    {p.player_name}
                  </option>
                ))}
              </select>
            </div>
            <Button
              className="bg-green-700 text-white mt-2"
              onClick={() => {
                // Here you would send the vote to the backend
                setVoteSubmitted(true);
              }}
              disabled={!vote}
            >
              Submit Vote
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center gap-2">
          <h2>Consultation Phase</h2>
          <Button
            className="bg-green-700 text-white"
            onClick={() => setVoting(true)}
          >
            Vote
          </Button>
        </div>
      )}
      <Button onClick={onNextPhase}>Go to next phase</Button>
      <Button className="bg-red-700 text-white" onClick={onEndGame}>
        End game
      </Button>
    </>
  );
};

export default ConsultationPhase;
