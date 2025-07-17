"use client";

import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import MinigameCore from "@/components/game/MinigameCore";
import ConsultationPhase from "@/components/game/ConsultationPhase";
import ReflectionPhase from "@/components/game/ReflectionPhase";
import OutreachPhase from "@/components/game/OutreachPhase";
import CardReveal from "@/components/game/CardReveal";
import Tutorial from "@/components/game/Tutorial";
import { useGame } from "@/hooks/useGame";
import { GamePhase, Player } from "@/types";
import { getPlayersByGameCode } from "@/lib/playerApi";
import { updateGamePhase } from "@/lib/gameApi";
import { subscribeToGameUpdates } from "@/lib/gameSubscriptions";

export default function GamePlayPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();

  const gameId: string = params.game_id as string;
  const playerId: string | null = searchParams.get("playerId");

  // Use the useGame hook
  const { game, loading, error, assignRoles } = useGame(gameId);

  const [players, setPlayers] = useState<Player[]>([]);
  const [currentPlayerId, setCurrentPlayerId] = useState<string | null>(
    playerId
  );
  const [gamePhase, setGamePhase] = useState<GamePhase | undefined>(
    game?.current_phase
  );

  useEffect(() => {
    getPlayersByGameCode(gameId).then((fetchedPlayers) => {
      setPlayers(fetchedPlayers);
      assignRoles(fetchedPlayers); // Only called once after fetching players
    });
  }, [gameId]);

  useEffect(() => {
    if (game?.current_phase) {
      setGamePhase(game.current_phase);
    }
  }, [game?.current_phase]);

  // Subscribe to real-time updates for this game
  useEffect(() => {
    const unsubscribe = subscribeToGameUpdates(gameId, (payload) => {
      if (payload.new && payload.new.current_phase) {
        setGamePhase(payload.new.current_phase);
      }
    });
    return unsubscribe;
  }, [gameId]);

  // Helper to check if current player is host
  const isCurrentUserHost =
    game &&
    players.find((p) => p.player_id === currentPlayerId)?.user_id ===
      game.host_user_id;

  // Helper to sync phase changes to backend (host only)
  const handleSetGamePhase = async (newPhase: GamePhase) => {
    setGamePhase(newPhase);
    if (!isCurrentUserHost) return;
    try {
      await updateGamePhase(gameId, newPhase);
    } catch (err) {
      // Optionally show a toast or fallback UI
      console.error("Failed to update game phase:", err);
    }
  };

  const handleMinigameGuess = (targetPlayerId: string, guessedRole: string) => {
    console.log(
      `Player ${currentPlayerId} guessed ${targetPlayerId} is ${guessedRole}`
    );
    // BACKEND INTEGRATION:
    // 1. Send this guess to the backend.
    // 2. Backend validates, scores, and sends update.
    // 3. MinigameCore handles local feedback.
  };

  const renderGameContent = () => {
    switch (gamePhase) {
      case "Lobby":
        return (
          <CardReveal
            roleName=""
            roleDescription=""
            setGamePhase={handleSetGamePhase}
          />
        );
      case "Tutorial":
        return (
          <Tutorial
            player={players.find(
              (p) => p.player_id === (currentPlayerId ?? "")
            )}
            game={game}
            players={players}
            setGamePhase={handleSetGamePhase}
          />
        );
      case "Reflection_MiniGame":
        return (
          <MinigameCore
            players={players}
            currentPlayerId={currentPlayerId ?? ""}
            onGuess={handleMinigameGuess}
            maxGuesses={3}
            setGamePhase={handleSetGamePhase}
          />
        );
      case "Reflection_RoleActions":
        return (
          <ReflectionPhase
            player={players.find(
              (p) => p.player_id === (currentPlayerId ?? "")
            )}
            setGamePhase={handleSetGamePhase}
          />
        );
      case "Outreach":
        return (
          <OutreachPhase
            player={players.find(
              (p) => p.player_id === (currentPlayerId ?? "")
            )}
            setGamePhase={handleSetGamePhase}
          />
        );
      case "Consultation_Discussion":
      case "Consultation_Elections":
      case "Consultation_TreasurerActions":
      case "Consultation_Voting_Prison":
        return (
          <ConsultationPhase
            players={players}
            player={players.find(
              (p) => p.player_id === (currentPlayerId ?? "")
            )}
            setGamePhase={handleSetGamePhase}
          />
        );
      case "Finished":
        return (
          <div className="text-center text-2xl p-10 bg-slate-800 rounded-lg">
            Game Over!
          </div>
        );
      default:
        return (
          <div className="text-center text-xl p-10">
            Waiting for game to load or unknown phase...
          </div>
        );
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">
        Loading game...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-red-100 text-red-700">
        Error loading game: {error.toString()}
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 sm:p-8 flex flex-col items-center justify-center font-sans">
      <header className="w-full max-w-4xl mb-8 text-center">
        <h1 className="text-3xl sm:text-4xl font-bold text-slate-900">
          Vices & Virtues
        </h1>
        <p className="text-md text-slate-900 mt-1">
          Game ID:{" "}
          <span className="font-semibold text-amber-400">{gameId}</span> -
          Phase:{" "}
          <span className="font-semibold text-green-400">
            {gamePhase?.toUpperCase()}
          </span>
        </p>
      </header>

      <main className="w-full max-w-3xl">{renderGameContent()}</main>

      <button
        onClick={() => router.push(`/game/lobby`)}
        className="mt-8 px-6 py-2 bg-sky-600 hover:bg-sky-500 text-white font-semibold rounded-lg shadow-md transition duration-200"
      >
        Back to Lobby
      </button>
    </div>
  );
}
