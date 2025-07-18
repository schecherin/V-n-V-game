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
import { GamePhase, Player, Role } from "@/types";
import { getPlayersByGameCode } from "@/lib/playerApi";
import {
  updateGamePhase,
  getAssignableRoles,
  insertReflectionPhaseGuess,
  calculateAndAssignMinigameResults,
  MinigameResult,
} from "@/lib/gameApi";
import { subscribeToGameUpdates } from "@/lib/gameSubscriptions";
import MinigameResults from "@/components/game/MinigameResults";

export default function GamePlayPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();

  const gameId: string = params.game_id as string;
  const playerId: string | null = searchParams.get("playerId");

  // Game state and hooks
  const { game, loading, error, assignRoles } = useGame(gameId);
  const [players, setPlayers] = useState<Player[]>([]);
  const [currentPlayerId] = useState<string | null>(playerId);
  const [gamePhase, setGamePhase] = useState<GamePhase | undefined>(
    game?.current_phase
  );
  const [roles, setRoles] = useState<Role[]>([]);
  const [minigameResult, setMinigameResult] = useState<MinigameResult>();

  // Fetch players and assign roles on mount
  useEffect(() => {
    getPlayersByGameCode(gameId).then((fetchedPlayers) => {
      assignRoles(fetchedPlayers);
      setPlayers(fetchedPlayers);
    });
  }, [gameId, assignRoles]);

  // Update phase from game state
  useEffect(() => {
    if (game?.current_phase) setGamePhase(game.current_phase);
  }, [game?.current_phase]);

  // Fetch assignable roles
  useEffect(() => {
    getAssignableRoles().then(setRoles);
  }, []);

  // Subscribe to real-time game phase updates
  useEffect(() => {
    const unsubscribe = subscribeToGameUpdates(gameId, (payload) => {
      if (payload.new && payload.new.current_phase) {
        setGamePhase(payload.new.current_phase);
      }
    });
    return unsubscribe;
  }, [gameId]);

  // Check if current user is host
  const isCurrentUserHost = !!(
    game &&
    players.find((p) => p.player_id === currentPlayerId)?.user_id ===
      game.host_user_id
  );

  // Host-only: update phase in backend
  const handleSetGamePhase = async (newPhase: GamePhase) => {
    setGamePhase(newPhase);
    if (!isCurrentUserHost) return;
    try {
      await updateGamePhase(gameId, newPhase);
    } catch (err) {
      console.error("Failed to update game phase:", err);
    }
  };

  // Handle minigame guess: insert guess into DB
  const handleMinigameGuess = async (
    targetPlayerId: string,
    guessedRole: string
  ) => {
    try {
      await insertReflectionPhaseGuess({
        game_code: gameId,
        day_number: game?.current_day ?? 1,
        guessed_player_id: targetPlayerId,
        guessed_role_name: guessedRole,
        guessing_player_id: currentPlayerId ?? "",
      });
    } catch (err) {
      console.error("Failed to insert minigame guess:", err);
    }
  };

  const handleMinigameResult = async () => {
    const results = await calculateAndAssignMinigameResults(gameId, 1);
    setMinigameResult(results.find((r) => r.playerId === playerId));
  };

  // Render content based on game phase
  const renderGameContent = () => {
    const currentPlayer = players.find(
      (p) => p.player_id === (currentPlayerId ?? "")
    );
    const roleName = currentPlayer?.current_role_name || "";
    const roleDescription =
      roles.find((r) => r.role_name === roleName)?.description || "";

    switch (gamePhase) {
      case "Lobby":
        router.push(`/${gameId}/lobby?playerId=${playerId}`);
        return null;
      case "RoleReveal":
        return (
          <CardReveal
            roleName={roleName}
            roleDescription={roleDescription}
            setGamePhase={handleSetGamePhase}
            player={currentPlayer}
            game={game}
            players={players}
          />
        );
      case "Tutorial":
        return (
          <Tutorial
            player={currentPlayer}
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
            isCurrentUserHost={isCurrentUserHost}
            gameId={gameId}
            roles={roles}
          />
        );
      case "Reflection_MiniGame_Result":
        handleMinigameResult();
        return (
          <MinigameResults
            position={minigameResult?.rank}
            points={minigameResult?.points}
            correctGuesses={minigameResult?.correctGuesses}
            isHost={isCurrentUserHost}
            gameId={gameId}
            setGamePhase={handleSetGamePhase}
          />
        );
      case "Reflection_RoleActions":
        return (
          <ReflectionPhase
            player={currentPlayer}
            setGamePhase={handleSetGamePhase}
          />
        );
      case "Outreach":
        return (
          <OutreachPhase
            player={currentPlayer}
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
            player={currentPlayer}
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
