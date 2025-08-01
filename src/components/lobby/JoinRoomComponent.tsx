"use client";
import { useState, useEffect } from "react";
import { useJoinGame } from "@/hooks/useJoinGame";
import { useSearchParams } from "next/navigation";

interface JoinRoomComponentProps {
  onBack: () => void;
}

export default function JoinRoomComponent({ onBack }: JoinRoomComponentProps) {
  const [gameCode, setGameCode] = useState("");
  const [playerName, setPlayerName] = useState("");
  const { joinGame, loading: isLoading, error } = useJoinGame();
  const searchParams = useSearchParams();

  // Pre-fill game code from URL parameter
  useEffect(() => {
    const codeFromUrl = searchParams.get("code");
    if (codeFromUrl) {
      setGameCode(codeFromUrl.toUpperCase());
    }
  }, [searchParams]);

  const handleJoinRoom = async () => {
    if (!gameCode.trim() || !playerName.trim()) {
      alert("Please enter both game code and player name");
      return;
    }
    await joinGame(gameCode, playerName);
  };

  return (
    <div className="space-y-6 bg-white p-6 rounded-lg shadow-lg">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Join Room</h2>
        <p className="text-gray-600">Enter the game code and your name</p>
      </div>

      <div className="space-y-4">
        <div>
          <label htmlFor="game-code" className="block text-sm font-medium mb-2">
            Game Code
          </label>
          <input
            id="game-code"
            type="text"
            value={gameCode}
            onChange={(e) => setGameCode(e.target.value.toUpperCase())}
            className="w-full border rounded px-3 py-2 text-center text-lg font-mono"
            placeholder="Enter game code"
            maxLength={6}
          />
        </div>

        <div>
          <label
            htmlFor="player-name"
            className="block text-sm font-medium mb-2"
          >
            Your Name
          </label>
          <input
            id="player-name"
            type="text"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            className="w-full border rounded px-3 py-2"
            placeholder="Enter your name"
            maxLength={20}
          />
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}
      </div>

      <div className="space-y-3">
        <button
          onClick={handleJoinRoom}
          disabled={isLoading}
          className="w-full py-3 bg-black text-white rounded hover:bg-gray-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? "Joining..." : "Join Game"}
        </button>

        <button
          onClick={onBack}
          className="w-full py-3 bg-gray-200 border border-gray-300 text-gray-700 rounded hover:bg-gray-300 transition"
        >
          Back to Menu
        </button>
      </div>
    </div>
  );
}
