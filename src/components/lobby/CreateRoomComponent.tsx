'use client';
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

interface CreateRoomComponentProps {
  onBack: () => void;
}

export default function CreateRoomComponent({ onBack }: CreateRoomComponentProps) {
  const router = useRouter();
  const [playerName, setPlayerName] = useState("");
  const [maxPlayers, setMaxPlayers] = useState(10);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const generateGameCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  };

  const handleCreateRoom = async () => {
    if (!playerName.trim()) {
      setError("Please enter your name");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      // Generate unique game code
      let gameCode = generateGameCode();
      let isUnique = false;
      
      while (!isUnique) {
        const { data: existingGame, error: checkError } = await supabase
          .from('games')
          .select('game_code')
          .eq('game_code', gameCode)
          .single();

        if (checkError && checkError.code === 'PGRST116') {
          // No game found with this code, so it's unique
          isUnique = true;
        } else if (!checkError) {
          // Game found, generate new code
          gameCode = generateGameCode();
        } else {
          throw checkError;
        }
      }

      // Create the game without auth
      const { data: game, error: gameError } = await supabase
        .from('games')
        .insert({
          game_code: gameCode,
          max_players: maxPlayers,
          current_player_count: 1,
          current_phase: 'Lobby',
          current_day: 0,
          game_status: 'Lobby',
          host_user_id: null // No auth needed
        })
        .select()
        .single();

      if (gameError) {
        console.error("Game creation error:", gameError);
        setError("Failed to create game: " + gameError.message);
        setIsLoading(false);
        return;
      }

      // Create host player without auth
      const { data: player, error: playerError } = await supabase
        .from('players')
        .insert({
          game_id: game.game_id,
          user_id: null, // No auth needed
          player_name: playerName.trim(),
          is_guest: true,
          status: 'Alive',
          personal_points: 0.00
        })
        .select()
        .single();

      if (playerError) {
        console.error("Player creation error:", playerError);
        setError("Failed to create player: " + playerError.message);
        setIsLoading(false);
        return;
      }

      // Navigate to game lobby
      router.push(`/game/lobby?gameId=${game.game_id}&playerId=${player.player_id}&gameCode=${gameCode}`);
    } catch (err) {
      console.error("Create room error:", err);
      setError("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
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