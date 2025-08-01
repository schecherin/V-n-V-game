"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCreateGame } from "@/hooks/useCreateGame";

interface CreateRoomComponentProps {
  onBack: () => void;
}

export default function CreateRoomComponent({
  onBack,
}: CreateRoomComponentProps) {
  const router = useRouter();
  const [playerName, setPlayerName] = useState("");
  const [maxPlayers, setMaxPlayers] = useState(10);
  const { create, loading: isLoading, error } = useCreateGame();

  const handleCreateRoom = async () => {
    if (!playerName.trim()) {
      // setError is now managed by the hook, but we can still show a local error
      alert("Please enter your name");
      return;
    }
    await create(playerName, maxPlayers);
  };

  return (
    <div className="space-y-6 bg-white p-6 rounded-lg shadow-lg">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Create Room</h2>
        <p className="text-gray-600">Set up your Vice & Virtue game</p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Your Name</label>
          <input
            type="text"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            className="w-full border rounded px-3 py-2"
            placeholder="Enter your name"
            maxLength={20}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Max Players</label>
          <select
            value={maxPlayers}
            onChange={(e) => setMaxPlayers(parseInt(e.target.value))}
            className="w-full border rounded px-3 py-2"
          >
            <option value={6}>6 Players</option>
            <option value={8}>8 Players</option>
            <option value={10}>10 Players</option>
            <option value={12}>12 Players</option>
          </select>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}
      </div>

      <div className="space-y-3">
        <button
          onClick={handleCreateRoom}
          disabled={isLoading}
          className="w-full py-3 bg-black text-white rounded hover:bg-gray-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? "Creating..." : "Create Game"}
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
