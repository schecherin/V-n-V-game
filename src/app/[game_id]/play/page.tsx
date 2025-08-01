"use client";

import { useParams, useSearchParams, useRouter } from "next/navigation";
import { useState, useMemo, useEffect, useCallback } from "react";
import { useGame } from "@/hooks/useGame";
import { Game, Player, Role } from "@/types";
import { isCurrentUserHost, getNextPhase } from "@/lib/gameUtils";
import {
  updateGamePhase,
  setGameDay,
  getAssignableRoles,
  getGameByCode,
} from "@/lib/gameApi";
import { useRoleAssignment } from "@/hooks/useRoleAssignment";
import { useMinigame } from "@/hooks/useMinigame";
import MinigameCore from "@/components/game/MinigameCore";
import ConsultationPhase from "@/components/game/ConsultationPhase";
import ReflectionPhase from "@/components/game/ReflectionPhase";
import OutreachPhase from "@/components/game/OutreachPhase";
import CardReveal from "@/components/game/CardReveal";
import Tutorial from "@/components/game/Tutorial";
import MinigameResults from "@/components/game/MinigameResults";
import ConsultationElections from "@/components/game/ConsultationElections";
import {
  subscribeToGameUpdates,
  subscribeToPlayerUpdates,
} from "@/lib/gameSubscriptions";
import { getPlayersByGameCode } from "@/lib/playerApi";

export default function GamePlayPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();

  const gameId: string = params.game_id as string;
  const playerId: string | null = searchParams.get("playerId");

  // Game state and hooks
  const [game, setGame] = useState<Game | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [currentPlayerId] = useState<string | null>(playerId);
  const gamePhase = game?.current_phase;

  const [roles, setRoles] = useState<Role[]>([]);

  // Memoize current player and host status to prevent re-calculations
  const { currentPlayer, isUserHost } = useMemo(() => {
    const p = players.find((p) => p.player_id === currentPlayerId);
    const isHost = isCurrentUserHost(game, currentPlayerId);
    return { currentPlayer: p, isUserHost: isHost };
  }, [players, currentPlayerId, game]);

  // Memoized refetch function
  const refetchData = useCallback(async () => {
    try {
      const [gameData, playersData] = await Promise.all([
        getGameByCode(gameId),
        getPlayersByGameCode(gameId),
      ]);
      setGame(gameData);
      setPlayers(playersData);
    } catch (err) {
      console.error("[lobby] Error re-fetching game and players:", err);
    }
  }, [gameId]);

  // Initial data fetch
  useEffect(() => {
    refetchData();
  }, [refetchData]);

  useEffect(() => {
    if (!gameId) {
      return;
    }

    const unsubscribeGame = subscribeToGameUpdates(gameId, (payload) => {
      if (payload.new) {
        setGame(payload.new);
      }
    });

    const unsubscribePlayers = subscribeToPlayerUpdates(gameId, (payload) => {
      getPlayersByGameCode(gameId)
        .then(setPlayers)
        .catch((err) => {
          console.error(
            "[lobby] Error re-fetching players on Realtime update:",
            err
          );
        });
    });

    return () => {
      unsubscribeGame();
      unsubscribePlayers();
    };
  }, [gameId]);

  useEffect(() => {
    getAssignableRoles().then(setRoles);
  }, []);

  // Custom hooks for role assignment
  useRoleAssignment({
    game,
    players,
    isUserHost,
    gameId,
    currentPlayerId,
  });

  // Custom hooks for minigame logic
  const { minigameResult, handleMinigameGuess } = useMinigame({
    game,
    gameId,
    playerId,
    currentPlayerId,
    isUserHost,
    gamePhase,
  });

  const handleSetGamePhase = async () => {
    if (!gamePhase) return;
    const nextPhase = getNextPhase(gamePhase, game);
    if (!isUserHost) return;
    try {
      await updateGamePhase(gameId, nextPhase);
    } catch (err) {
      console.error("Failed to update game phase:", err);
    }
  };

  const renderGameContent = () => {
    const roleName = currentPlayer?.current_role_name || "Assigning...";
    const roleDescription =
      roles.find((r) => r.role_name === roleName)?.description ||
      "Please wait while the host starts the game.";

    switch (gamePhase) {
      case "Lobby":
        router.push(`/${gameId}/lobby?playerId=${playerId}`);
        return null;
      case "RoleReveal":
        return (
          <CardReveal
            players={players}
            roleName={roleName}
            roleDescription={roleDescription}
            onNextPhase={() => {
              setGameDay(gameId, 1);
              handleSetGamePhase();
            }}
            player={currentPlayer}
            game={game}
          />
        );
      case "Tutorial":
        return (
          <Tutorial
            player={currentPlayer}
            game={game}
            players={players}
            onNextPhase={() => handleSetGamePhase()}
          />
        );
      case "Reflection_RoleActions":
        return (
          <ReflectionPhase
            player={currentPlayer}
            onNextPhase={() => handleSetGamePhase()}
          />
        );
      case "Reflection_MiniGame":
        return (
          <MinigameCore
            players={players}
            currentPlayerId={currentPlayerId ?? ""}
            onGuess={handleMinigameGuess}
            maxGuesses={3}
            onNextPhase={() => handleSetGamePhase()}
            isCurrentUserHost={isUserHost}
            roles={roles}
          />
        );
      case "Reflection_MiniGame_Result":
        return (
          <MinigameResults
            position={minigameResult?.rank || 0}
            points={minigameResult?.totalPoints || 0}
            onNextPhase={() => handleSetGamePhase()}
            isHost={isUserHost}
          />
        );
      case "Consultation_Elections_Chairperson":
      case "Consultation_Elections_Secretary":
      case "Consultation_Elections_Result":
        return (
          <ConsultationElections
            game={game}
            players={players}
            currentPlayer={currentPlayer}
            gameId={gameId}
            dayNumber={game?.current_day || 1}
            currentPhase={gamePhase}
            onNextPhase={() => {
              handleSetGamePhase();
            }}
            isCurrentUserHost={isUserHost}
          />
        );
      case "Outreach":
        return (
          <OutreachPhase
            player={currentPlayer}
            onNextPhase={() => handleSetGamePhase()}
            isCurrentUserHost={isUserHost}
          />
        );
      case "Consultation_Discussion":
      case "Consultation_TreasurerActions":
      case "Consultation_Voting_Prison":
        return (
          <ConsultationPhase
            players={players}
            player={currentPlayer}
            onNextPhase={() => {
              // TODO: the day should increment once before going to reflection phase
              setGameDay(gameId, (game?.current_day ?? 1) + 1);
              handleSetGamePhase();
            }}
            onEndGame={() => handleSetGamePhase()}
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
  /* 
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
  } */

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
            {gamePhase?.replace(/_/g, " ").toUpperCase()}
          </span>
        </p>
      </header>
      <main className="w-full max-w-3xl">{renderGameContent()}</main>
    </div>
  );
}
