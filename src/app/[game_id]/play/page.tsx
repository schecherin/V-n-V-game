"use client";

import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useMemo } from "react";
import MinigameCore from "@/components/game/MinigameCore";
import ConsultationPhase from "@/components/game/ConsultationPhase";
import ReflectionPhase from "@/components/game/ReflectionPhase";
import OutreachPhase from "@/components/game/OutreachPhase";
import CardReveal from "@/components/game/CardReveal";
import Tutorial from "@/components/game/Tutorial";
import { useGame } from "@/hooks/useGame";
import { GamePhase, Player, Role } from "@/types";
import { getPlayerById } from "@/lib/playerApi";
import { isCurrentUserHost } from "@/lib/gameUtils";
import {
  updateGamePhase,
  getAssignableRoles,
  insertReflectionPhaseGuess,
  setGameDay,
} from "@/lib/gameApi";
import { supabase } from "@/lib/supabase/client";
import { assignRolesToPlayers } from "@/lib/roleAssign";
import MinigameResults from "@/components/game/MinigameResults";
import {
  calculateMinigameResults,
  type MinigameResult,
} from "@/lib/minigameAPI";

export default function GamePlayPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();

  const gameId: string = params.game_id as string;
  const playerId: string | null = searchParams.get("playerId");

  // Game state and hooks
  const { game, players, loading, error } = useGame(gameId);
  const [currentPlayerId] = useState<string | null>(playerId);
  const gamePhase = game?.current_phase;

  const [roles, setRoles] = useState<Role[]>([]);
  const [minigameResult, setMinigameResult] = useState<MinigameResult>();
  const [isAssigningRoles, setIsAssigningRoles] = useState(false);

  // Memoize current player and host status to prevent re-calculations
  const { currentPlayer, isUserHost } = useMemo(() => {
    const p = players.find((p) => p.player_id === currentPlayerId);
    const isHost = isCurrentUserHost(game, currentPlayerId);
    return { currentPlayer: p, isUserHost: isHost };
  }, [players, currentPlayerId, game]);

  useEffect(() => {
    const handleRoleAssignment = async () => {
      // Check if roles are already assigned
      const rolesAreAssigned = players.some((p) => p.current_role_name);

      if (
        isUserHost &&
        game?.current_phase === "RoleReveal" &&
        !rolesAreAssigned &&
        !isAssigningRoles
      ) {
        setIsAssigningRoles(true);
        console.log("Host is assigning roles via edge function...");

        try {
          // Get the current user's ID (the host)
          const {
            data: { user },
          } = await supabase.auth.getUser();

          if (!user) {
            console.error("Host user not authenticated");
            setIsAssigningRoles(false);
            return;
          }
          if (!currentPlayerId) {
            console.error("Current player ID is null");
            setIsAssigningRoles(false);
            return;
          }
          const result = await assignRolesToPlayers(gameId, currentPlayerId);
          if (result.success) {
            console.log("Roles assigned successfully:", result.assignments);
            // The real-time subscription should automatically update the UI
          } else {
            console.error("Failed to assign roles:", result.error);
          }
        } catch (error) {
          console.error("Error during role assignment:", error);
        } finally {
          setIsAssigningRoles(false);
        }
      }
    };

    // Ensure we have the necessary data before trying to assign roles
    if (game && players.length > 0 && isUserHost !== undefined) {
      handleRoleAssignment();
    }
  }, [game, players, isUserHost, gameId, isAssigningRoles]);

  const handleSetGamePhase = async () => {
    if (!gamePhase) return;
    const nextPhase = getNextPhase(gamePhase);
    if (!isUserHost) return;
    try {
      await updateGamePhase(gameId, nextPhase);
    } catch (err) {
      console.error("Failed to update game phase:", err);
    }
  };

  const handleMinigameGuess = async (
    targetPlayerId: string,
    guessedRole: string
  ) => {
    if (!currentPlayerId) return;
    try {
      await insertReflectionPhaseGuess({
        game_code: gameId,
        day_number: game?.current_day ?? 1,
        guessed_player_id: targetPlayerId,
        guessed_role_name: guessedRole,
        guessing_player_id: currentPlayerId,
      });
    } catch (err) {
      console.error("Failed to insert minigame guess:", err);
    }
  };
  // Add this state near your other useState declarations at the top of the component
  const [resultsCalculated, setResultsCalculated] = useState(false);

  const handleMinigameResult = async () => {
    if (resultsCalculated || !gameId || !playerId) {
      return;
    }

    setResultsCalculated(true);

    try {
      if (isUserHost) {
        // HOST CALCULATES AND UPDATES DATABASE
        console.log("Host calculating results for everyone...");
        const results = await calculateMinigameResults(
          gameId,
          game?.current_day ?? 0,
          true
        );

        const myResult = results.find((r) => r.playerId === playerId);
        if (myResult) {
          setMinigameResult(myResult);
        }
      } else {
        // GUESTS: Just poll database for their updated rank/points
        console.log("Guest waiting for results...");

        let attempts = 0;
        const maxAttempts = 30; // 30 seconds max

        while (attempts < maxAttempts) {
          // Fetch own player data directly from database
          const player = await getPlayerById(playerId);

          // Check if rank has been set (meaning host calculated)
          if (player.last_mini_game_rank && player.last_mini_game_rank > 0) {
            // Create result object from player data
            const myResult: MinigameResult = {
              playerId: player.player_id,
              playerName: player.player_name,
              rank: player.last_mini_game_rank,
              points: 0, // We don't store points earned separately, could calculate if needed
              totalPoints: player.personal_points,
            };

            setMinigameResult(myResult);
            console.log("Guest found their results:", myResult);
            break;
          }
          // I'm waiting here idk if its the best idea tbh.
          await new Promise((resolve) => setTimeout(resolve, 1000));
          attempts++;
        }

        if (attempts === maxAttempts) {
          console.error("Timed out waiting for results");
          setResultsCalculated(false);
        }
      }
    } catch (error) {
      console.error("Failed to handle minigame results:", error);
      setResultsCalculated(false);
    }
  };

  // Add this useEffect to reset the flag when phase changes
  useEffect(() => {
    if (gamePhase !== "Reflection_MiniGame_Result") {
      setResultsCalculated(false);
      setMinigameResult(undefined);
    }
  }, [gamePhase]);

  // Phase transition map for cleaner logic
  const getNextPhase = (currentPhase: GamePhase): GamePhase => {
    const phaseTransitions: Record<GamePhase, GamePhase> = {
      Lobby: "Lobby",
      RoleReveal: game?.tutorial ? "Tutorial" : "Reflection_MiniGame",
      Tutorial: "Reflection_MiniGame",
      Reflection_RoleActions: "Reflection_MiniGame",
      Reflection_MiniGame: "Reflection_MiniGame_Result",
      Reflection_MiniGame_Result:
        game?.current_day === 1
          ? "Consultation_Elections_Chairperson"
          : game?.include_outreach_phase
          ? "Outreach"
          : "Consultation_Discussion",
      Consultation_Elections_Chairperson: "Consultation_Elections_Secretary",
      Consultation_Elections_Secretary: "Consultation_Elections_Result",
      Consultation_Elections_Result: game?.include_outreach_phase
        ? "Outreach"
        : "Consultation_Discussion",
      Outreach: "Consultation_Discussion",
      // TODO: fix these phases
      Consultation_Discussion: "Reflection_RoleActions",
      Consultation_TreasurerActions: "Reflection_RoleActions",
      Consultation_Voting_Prison: "Reflection_RoleActions",
      Paused: "Paused", // No transition
      Finished: "Finished", // No transition
    };

    console.log("currentPhase", currentPhase);
    console.log("day", game?.current_day);
    return phaseTransitions[currentPhase] || currentPhase;
  };

  // Add this useEffect to trigger calculation when entering results phase
  useEffect(() => {
    if (gamePhase === "Reflection_MiniGame_Result" && !resultsCalculated) {
      handleMinigameResult();
    }
  }, [gamePhase, resultsCalculated, gameId, playerId, isUserHost]);

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
            gameId={gameId}
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
        return (
          <ReflectionPhase
            player={currentPlayer}
            onNextPhase={() => handleSetGamePhase("Reflection_MiniGame")}
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
            {gamePhase?.replace(/_/g, " ").toUpperCase()}
          </span>
        </p>
      </header>
      <main className="w-full max-w-3xl">{renderGameContent()}</main>
    </div>
  );
}
