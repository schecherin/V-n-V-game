import { getGameIncludeOutreachPhase } from "@/lib/gameApi";
import { GamePhase } from "@/types";
import React, { useState } from "react";
import Button from "../ui/Button";

interface MinigameResultsProps {
  position?: number;
  points?: number;
  correctGuesses?: number;
  isHost: boolean;
  gameId: string;
  setGamePhase: (phase: GamePhase) => void;
}

const MinigameResults: React.FC<MinigameResultsProps> = ({
  position,
  points,
  correctGuesses,
  isHost,
  gameId,
  setGamePhase,
}) => {
  const [loadingNextPhase, setLoadingNextPhase] = useState(false);

  const handleNextPhase = async () => {
    setLoadingNextPhase(true);
    try {
      const outreachEnabled = await getGameIncludeOutreachPhase(gameId);
      if (outreachEnabled) {
        setGamePhase("Outreach");
      } else {
        setGamePhase("Consultation_Discussion");
      }
    } catch (err) {
      // fallback: go to outreach
      setGamePhase("Outreach");
    } finally {
      setLoadingNextPhase(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md mx-auto text-center border border-slate-300">
      <h2 className="text-2xl font-bold mb-4 text-slate-900">
        Minigame Results
      </h2>
      <div className="mb-4">
        <span className="text-lg font-semibold text-slate-700">
          Your Position:
        </span>
        <div className="text-3xl font-bold text-amber-500">#{position}</div>
      </div>
      <div className="mb-4">
        <span className="text-lg font-semibold text-slate-700">
          Points Scored:
        </span>
        <div className="text-3xl font-bold text-green-500">{points}</div>
      </div>
      <div className="mb-4">
        <span className="text-lg font-semibold text-slate-700">
          Correct Guesses:
        </span>
        <div className="text-3xl font-bold text-blue-500">{correctGuesses}</div>
      </div>
      {isHost && (
        <Button onClick={handleNextPhase} disabled={loadingNextPhase}>
          {loadingNextPhase ? "Loading..." : "Go to next phase"}
        </Button>
      )}
    </div>
  );
};

export default MinigameResults;
