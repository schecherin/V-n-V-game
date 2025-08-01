import { getGameIncludeOutreachPhase } from "@/lib/gameApi";
import { GamePhase } from "@/types";
import React, { useState } from "react";

interface MinigameResultsProps {
  position?: number;
  points?: number;
  isHost: boolean;
  gameId: string;
  setGamePhase: (phase: GamePhase) => void;
}

const MinigameResults: React.FC<MinigameResultsProps> = ({
  position,
  points,
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
      console.error("Failed to get game outreach phase:", err);
      // fallback: go to outreach
      setGamePhase("Outreach");
    } finally {
      setLoadingNextPhase(false);
    }
  };

  // Show loading state while results are being calculated
  if (
    position === undefined ||
    points === undefined 
  ) {
    return (
      <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md mx-auto text-center border border-slate-300">
        <h2 className="text-2xl font-bold mb-4 text-slate-900">
          Loading Results...
        </h2>
        <div className="animate-pulse">
          <div className="h-12 bg-slate-200 rounded mb-4"></div>
          <div className="h-12 bg-slate-200 rounded"></div>
        </div>
        <p className="text-sm text-slate-600 mt-4">
          Please wait while the host finalizes the results...
        </p>
      </div>
    );
  }

  const getOrdinalSuffix = (num: number) => {
    const j = num % 10;
    const k = num % 100;
    if (j === 1 && k !== 11) return "st";
    if (j === 2 && k !== 12) return "nd";
    if (j === 3 && k !== 13) return "rd";
    return "th";
  };
  const ordinalSuffix = getOrdinalSuffix(position);

  return (
    <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md mx-auto text-center border border-slate-300">
      <h2 className="text-2xl font-bold mb-6 text-slate-900">
        Minigame Results
      </h2>

      <div className="space-y-6">
        <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
          <span className="text-lg font-semibold text-slate-700">
            Your Position
          </span>
          <div className="text-4xl font-bold text-amber-600 mt-2">
            {position}
            {ordinalSuffix}
          </div>
        </div>

        <div className="bg-green-50 rounded-lg p-4 border border-green-200">
          <span className="text-lg font-semibold text-slate-700">
            Total Points:
          </span>
          <div className="text-4xl font-bold text-green-600 mt-2">
            {points}
          </div>
        </div>
      </div>

      {isHost ? (
        <button 
          onClick={handleNextPhase} 
          disabled={loadingNextPhase}
          className="mt-8 w-full px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {loadingNextPhase ? "Loading..." : "Go to Next Phase"}
        </button>
      ) : (
        <div className="mt-8 text-brown-medium italic text-lg">
          Waiting for the host to continue...
        </div>
      )}
    </div>
  );
};

export default MinigameResults;
