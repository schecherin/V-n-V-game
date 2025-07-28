"use client";

import React, { useState } from "react";
import Button from "../ui/Button";
import { Player, Role } from "@/types";

interface MinigameCoreProps {
  players: Player[];
  currentPlayerId: string; // ID of the player viewing the minigame
  onGuess: (targetPlayerId: string, guessedRole: string) => void; // Callback when a guess is made
  maxGuesses?: number;
  onNextPhase: () => void;
  isCurrentUserHost: boolean;
  gameId: string;
  roles: Role[];
}

export default function MinigameCore({
  players,
  currentPlayerId,
  onGuess,
  maxGuesses = 10,
  onNextPhase,
  isCurrentUserHost,
  gameId,
  roles,
}: Readonly<MinigameCoreProps>) {
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [guessedRole, setGuessedRole] = useState<string>("");
  const [guessesMade, setGuessesMade] = useState<Record<string, string>>({}); // { playerId: guessedRole }
  const [feedback, setFeedback] = useState<string>(""); // Feedback on guess
  const [loadingNextPhase, setLoadingNextPhase] = useState(false);

  const availablePlayers = players.filter(
    (p) => p.player_id !== currentPlayerId && p.status !== "Dead"
  );

  const guessesRemaining =
    Math.min(maxGuesses, players.length - 1) - Object.keys(guessesMade).length;
  const handlePlayerSelect = (player: Player) => {
    if (guessesMade[player.player_id]) {
      setFeedback(`You have already made a guess for ${player.player_name}.`);
      setSelectedPlayer(null);
      return;
    }
    if (guessesRemaining <= 0) {
      setFeedback("No guesses remaining for this round.");
      return;
    }
    setSelectedPlayer(player);
    setGuessedRole(""); // Reset role selection
    setFeedback("");
  };

  const handleGuessSubmit = () => {
    if (selectedPlayer && guessedRole) {
      if (guessesRemaining <= 0) {
        setFeedback("No guesses remaining.");
        return;
      }
      if (guessesMade[selectedPlayer.player_id]) {
        setFeedback(
          `You've already guessed for ${selectedPlayer.player_name}.`
        );
        return;
      }

      onGuess(selectedPlayer.player_id, guessedRole);
      setGuessesMade((prev) => ({
        ...prev,
        [selectedPlayer.player_id]: guessedRole,
      }));
      // BACKEND INTEGRATION: The backend would provide actual information.
      setFeedback(
        `You guessed ${selectedPlayer.player_name} is ${guessedRole}. (${
          guessesRemaining - 1
        } guesses left)`
      );
      setSelectedPlayer(null);
      setGuessedRole("");
    }
  };

  const handleNextPhase = async () => {
    setLoadingNextPhase(true);
    try {
      onNextPhase();
    } catch (err) {
      console.log(err);
    } finally {
      setLoadingNextPhase(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 bg-white text-white rounded-xl shadow-2xl w-full max-w-3xl mx-auto border border-slate-700">
      <h2 className="text-2xl sm:text-3xl font-bold mb-2 text-center text-slate-900">
        Minigame: Guess Their Roles!
      </h2>
      <p className="text-center text-slate-400 mb-6">
        You have{" "}
        <span className="font-semibold text-amber-400">{guessesRemaining}</span>{" "}
        {guessesRemaining === 1 ? "guess" : "guesses"} remaining.
      </p>

      {feedback && (
        <div
          className={`mb-4 p-3 rounded-md text-center ${
            feedback.includes("No guesses") || feedback.includes("already")
              ? "bg-red-500/20 text-red-300"
              : "bg-sky-500/20 text-sky-300"
          }`}
        >
          {feedback}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Player Selection List */}
        <div className="bg-slate-700 p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-3 text-slate-200">
            Select a Player to Guess:
          </h3>
          {availablePlayers.length > 0 ? (
            <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
              {availablePlayers.map((player) => (
                <button
                  key={player.player_id}
                  onClick={() => handlePlayerSelect(player)}
                  disabled={
                    !!guessesMade[player.player_id] || guessesRemaining <= 0
                  }
                  className={`w-full flex items-center p-3 rounded-md transition-all duration-200 text-left
                    ${
                      selectedPlayer?.player_id === player.player_id
                        ? "bg-sky-600 ring-2 ring-sky-400"
                        : "bg-slate-600 hover:bg-slate-500"
                    }
                    ${
                      guessesMade[player.player_id]
                        ? "opacity-50 cursor-not-allowed"
                        : "hover:bg-slate-500"
                    }
                    ${
                      guessesRemaining <= 0 && !guessesMade[player.player_id]
                        ? "opacity-50 cursor-not-allowed"
                        : ""
                    }
                  `}
                >
                  <img
                    src={`https://placehold.co/40x40/777/FFF?text=${player.player_name.charAt(
                      0
                    )}`}
                    alt={player.player_name}
                    className="w-8 h-8 rounded-full mr-3 border border-slate-400 object-cover"
                    onError={(e) =>
                      (e.currentTarget.src = `https://placehold.co/40x40/777/FFF?text=${player.player_name.charAt(
                        0
                      )}`)
                    }
                  />
                  <span className="flex-grow">{player.player_name}</span>
                  {guessesMade[player.player_id] && (
                    <span className="text-xs text-slate-400">
                      (Guessed: {guessesMade[player.player_id]})
                    </span>
                  )}
                </button>
              ))}
            </div>
          ) : (
            <p className="text-slate-400">
              No other players available to guess.
            </p>
          )}
        </div>

        {/* Guessing Interface */}
        {selectedPlayer &&
          guessesRemaining > 0 &&
          !guessesMade[selectedPlayer.player_id] && (
            <div className="bg-slate-700/50 p-4 rounded-lg flex flex-col">
              <h3 className="text-lg font-semibold mb-3 text-slate-200">
                Guess Role for:{" "}
                <span className="text-sky-400">
                  {selectedPlayer.player_name}
                </span>
              </h3>
              <div className="flex-grow space-y-3">
                <label
                  htmlFor="role-select"
                  className="block text-sm font-medium text-slate-300"
                >
                  Select Role:
                </label>
                <select
                  id="role-select"
                  value={guessedRole}
                  onChange={(e) => setGuessedRole(e.target.value)}
                  className="w-full p-2.5 rounded-md bg-slate-800 border border-slate-500 focus:ring-sky-500 focus:border-sky-500 text-white"
                >
                  <option value="" disabled>
                    -- Select a Role --
                  </option>
                  {roles.map((role: any) => (
                    <option key={role.role_name} value={role.role_name}>
                      {role.role_name}
                    </option>
                  ))}
                </select>
              </div>
              <button
                onClick={handleGuessSubmit}
                disabled={!guessedRole}
                className="mt-4 w-full px-4 py-2.5 bg-green-600 hover:bg-green-500 text-white font-semibold rounded-lg shadow-md transition duration-200 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-opacity-50 disabled:opacity-50"
              >
                Submit Guess for {selectedPlayer.player_name}
              </button>
            </div>
          )}
        {guessesRemaining <= 0 && (
          <div className="bg-slate-700/50 p-4 rounded-lg flex flex-col items-center justify-center md:col-span-1">
            <h3 className="text-lg font-semibold mb-3 text-slate-200 text-center">
              All Guesses Used
            </h3>
            <p className="text-slate-400 text-center">
              Waiting for the next phase or results.
            </p>
            {/* Only host can see the button */}
            {isCurrentUserHost && (
              <Button onClick={handleNextPhase} disabled={loadingNextPhase}>
                {loadingNextPhase ? "Loading..." : "Go to next phase"}
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
