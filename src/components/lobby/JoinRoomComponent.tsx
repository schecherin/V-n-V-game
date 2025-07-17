'use client';
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

interface JoinRoomComponentProps {
  onBack: () => void;
}

export default function JoinRoomComponent({ onBack }: JoinRoomComponentProps) {
  const router = useRouter();
  const [gameCode, setGameCode] = useState("");
  const [playerName, setPlayerName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleJoinRoom = async () => {
    if (!gameCode.trim() || !playerName.trim()) {
      setError("Please enter both game code and player name");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      // Sign in anonymously if not already signed in
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        const { error: authError } = await supabase.auth.signInAnonymously();
        if (authError) {
          setError("Authentication failed");
          setIsLoading(false);
          return;
        }
      }
      // Check if game exists and is in lobby state
      const { data: game, error: gameError } = await supabase
        .from('games')
        .select('*')
        .eq('game_code', gameCode.trim())
        .eq('current_phase', 'Lobby')
        .single();

      if (gameError || !game) {
        setError("Game not found or already started");
        setIsLoading(false);
        return;
      }

      // Check if game is full
      if (game.current_player_count >= game.max_players) {
        setError("Game is full");
        setIsLoading(false);
        return;
      }

      // Check if player name is already taken in this game
      const { data: existingPlayer, error: playerCheckError } = await supabase
        .from('players')
        .select('player_name')
        .eq('game_id', game.game_id)
        .eq('player_name', playerName.trim())
        .single();

      if (existingPlayer) {
        setError("Player name already taken in this game");
        setIsLoading(false);
        return;
      }

      // Create player
      const { data: player, error: playerError } = await supabase
        .from('players')
        .insert({
          game_id: game.game_id,
          player_name: playerName.trim(),
          is_guest: true,
          status: 'Alive'
        })
        .select()
        .single();

      if (playerError) {
        setError("Failed to join game");
        setIsLoading(false);
        return;
      }

      // Update game player count
      const { error: updateError } = await supabase
        .from('games')
        .update({
          current_player_count: game.current_player_count + 1
        })
        .eq('game_id', game.game_id);

      if (updateError) {
        console.error("Failed to update player count:", updateError);
      }

      // Navigate to game lobby
      router.push(`/game/lobby?gameId=${game.game_id}&playerId=${player.player_id}`);
    } catch (err) {
      setError("An unexpected error occurred");
      console.error("Join room error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 bg-white p-6 rounded-lg shadow-lg">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Join Room</h2>
        <p className="text-gray-600">Enter the game code and your name</p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Game Code</label>
          <input
            type="text"
            value={gameCode}
            onChange={(e) => setGameCode(e.target.value.toUpperCase())}
            className="w-full border rounded px-3 py-2 text-center text-lg font-mono"
            placeholder="Enter game code"
            maxLength={6}
          />
        </div>

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