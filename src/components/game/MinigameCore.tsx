'use client';

import React, { useState } from 'react';
import Button from '../ui/Button';

interface Player {
  id: string;
  name: string;
  avatar?: string;
  isTargetable?: boolean; // Can this player be targeted in the minigame?
  status?: 'alive' | 'dead' | 'hospitalized'; // For future use
}

interface MinigameCoreProps {
  players: Player[];
  currentPlayerId: string; // ID of the player viewing the minigame
  onGuess: (targetPlayerId: string, guessedRole: string) => void; // Callback when a guess is made
  maxGuesses?: number;
  setGamePhase: (phase: "minigame" | "reflection" | "outreach" | "consultation" | "ended") => void;
}

// Sample roles for guessing - with bakend, these must be more dynamic
const POSSIBLE_ROLES = ["Murder", "Empathy", "Intoxication", "Justice", "Envy", "Torment", "Certainty", "Vengeance", "Sacrifice", "Truthfulness", "Vice Worshipper", "Virtue Seeker"];

export default function MinigameCore({
  players,
  currentPlayerId,
  onGuess,
  maxGuesses = 10,
  setGamePhase,
}: MinigameCoreProps) {
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [guessedRole, setGuessedRole] = useState<string>('');
  const [guessesMade, setGuessesMade] = useState<Record<string, string>>({}); // { playerId: guessedRole }
  const [feedback, setFeedback] = useState<string>(''); // Feedback on guess

  const availablePlayers = players.filter(
    (p) => p.id !== currentPlayerId && (p.isTargetable === undefined || p.isTargetable === true) && p.status !== 'dead'
  );

  const guessesRemaining = maxGuesses - Object.keys(guessesMade).length;

  const handlePlayerSelect = (player: Player) => {
    if (guessesMade[player.id]) {
        setFeedback(`You have already made a guess for ${player.name}.`);
        setSelectedPlayer(null);
        return;
    }
    if (guessesRemaining <= 0) {
        setFeedback("No guesses remaining for this round.");
        return;
    }
    setSelectedPlayer(player);
    setGuessedRole(''); // Reset role selection
    setFeedback('');
  };

  const handleGuessSubmit = () => {
    if (selectedPlayer && guessedRole) {
      if (guessesRemaining <= 0) {
        setFeedback("No guesses remaining.");
        return;
      }
      if (guessesMade[selectedPlayer.id]) {
        setFeedback(`You've already guessed for ${selectedPlayer.name}.`);
        return;
      }

      onGuess(selectedPlayer.id, guessedRole);
      setGuessesMade(prev => ({ ...prev, [selectedPlayer.id]: guessedRole }));
      // BACKEND INTEGRATION: The backend would provide actual information.
      setFeedback(`You guessed ${selectedPlayer.name} is ${guessedRole}. (${guessesRemaining -1} guesses left)`);
      setSelectedPlayer(null);
      setGuessedRole('');
    }
  };

  return (
    <div className="p-4 sm:p-6 bg-white text-white rounded-xl shadow-2xl w-full max-w-3xl mx-auto border border-slate-700">
      <h2 className="text-2xl sm:text-3xl font-bold mb-2 text-center text-slate-900">Minigame: Guess Their Roles!</h2>
      <p className="text-center text-slate-400 mb-6">
        You have <span className="font-semibold text-amber-400">{guessesRemaining}</span> {guessesRemaining === 1 ? 'guess' : 'guesses'} remaining.
      </p>

      {feedback && (
        <div className={`mb-4 p-3 rounded-md text-center ${feedback.includes("No guesses") || feedback.includes("already") ? 'bg-red-500/20 text-red-300' : 'bg-sky-500/20 text-sky-300'}`}>
          {feedback}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Player Selection List */}
        <div className="bg-slate-700 p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-3 text-slate-200">Select a Player to Guess:</h3>
          {availablePlayers.length > 0 ? (
            <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
              {availablePlayers.map((player) => (
                <button
                  key={player.id}
                  onClick={() => handlePlayerSelect(player)}
                  disabled={!!guessesMade[player.id] || guessesRemaining <= 0}
                  className={`w-full flex items-center p-3 rounded-md transition-all duration-200 text-left
                    ${selectedPlayer?.id === player.id ? 'bg-sky-600 ring-2 ring-sky-400' : 'bg-slate-600 hover:bg-slate-500'}
                    ${guessesMade[player.id] ? 'opacity-50 cursor-not-allowed' : 'hover:bg-slate-500'}
                    ${guessesRemaining <= 0 && !guessesMade[player.id] ? 'opacity-50 cursor-not-allowed' : ''}
                  `}
                >
                  <img
                    src={player.avatar || `https://placehold.co/40x40/777/FFF?text=${player.name.charAt(0)}`}
                    alt={player.name}
                    className="w-8 h-8 rounded-full mr-3 border border-slate-400 object-cover"
                    onError={(e) => (e.currentTarget.src = `https://placehold.co/40x40/777/FFF?text=${player.name.charAt(0)}`)}
                  />
                  <span className="flex-grow">{player.name}</span>
                  {guessesMade[player.id] && <span className="text-xs text-slate-400">(Guessed: {guessesMade[player.id]})</span>}
                </button>
              ))}
            </div>
          ) : (
            <p className="text-slate-400">No other players available to guess.</p>
          )}
        </div>

        {/* Guessing Interface */}
        {selectedPlayer && guessesRemaining > 0 && !guessesMade[selectedPlayer.id] && (
          <div className="bg-slate-700/50 p-4 rounded-lg flex flex-col">
            <h3 className="text-lg font-semibold mb-3 text-slate-200">
              Guess Role for: <span className="text-sky-400">{selectedPlayer.name}</span>
            </h3>
            <div className="flex-grow space-y-3">
                <label htmlFor="role-select" className="block text-sm font-medium text-slate-300">Select Role:</label>
                <select
                    id="role-select"
                    value={guessedRole}
                    onChange={(e) => setGuessedRole(e.target.value)}
                    className="w-full p-2.5 rounded-md bg-slate-800 border border-slate-500 focus:ring-sky-500 focus:border-sky-500 text-white"
                >
                    <option value="" disabled>-- Select a Role --</option>
                    {POSSIBLE_ROLES.map(role => (
                    <option key={role} value={role}>{role}</option>
                    ))}
                </select>
            </div>
            <button
              onClick={handleGuessSubmit}
              disabled={!guessedRole}
              className="mt-4 w-full px-4 py-2.5 bg-green-600 hover:bg-green-500 text-white font-semibold rounded-lg shadow-md transition duration-200 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-opacity-50 disabled:opacity-50"
            >
              Submit Guess for {selectedPlayer.name}
            </button>
          </div>
        )}
        {guessesRemaining <= 0 && (
             <div className="bg-slate-700/50 p-4 rounded-lg flex flex-col items-center justify-center md:col-span-1">
                <h3 className="text-lg font-semibold mb-3 text-slate-200 text-center">All Guesses Used</h3>
                <p className="text-slate-400 text-center">Waiting for the next phase or results.</p>
                {/* BACKEND INTEGRATION: Could be a button to "Confirm End of Minigame" or automatically proceed */}
                <Button onClick={() => setGamePhase("outreach")}>Go to next phase</Button>
             </div>
        )}
      </div>
    </div>
  );
}
