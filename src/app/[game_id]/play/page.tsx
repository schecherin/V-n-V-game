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
import { getPlayersByGameCode } from "@/lib/playerApi";
import {
  updateGamePhase,
  getAssignableRoles,
  insertReflectionPhaseGuess,
} from "@/lib/gameApi";
import { supabase } from "@/lib/supabase/client";
import { assignRolesToPlayers } from "@/lib/roleAssign";
// Import both subscription functions
import { subscribeToGameUpdates, subscribeToPlayerUpdates } from "@/lib/gameSubscriptions";
import MinigameResults from "@/components/game/MinigameResults";
import { calculateMinigameResults, updateMinigameResults, type MinigameResult } from "@/lib/minigameAPI";

export default function GamePlayPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();

  const gameId: string = params.game_id as string;
  const playerId: string | null = searchParams.get("playerId");

  // Game state and hooks
  const { game, loading, error } = useGame(gameId);
  const [players, setPlayers] = useState<Player[]>([]);
  const [currentPlayerId] = useState<string | null>(playerId);
  const [gamePhase, setGamePhase] = useState<GamePhase | undefined>(
    game?.current_phase
  );
  const [roles, setRoles] = useState<Role[]>([]);
  const [minigameResult, setMinigameResult] = useState<MinigameResult>();
  const [isAssigningRoles, setIsAssigningRoles] = useState(false);

  // Fetch initial data (players and roles)
  useEffect(() => {
    if (gameId) {
      getPlayersByGameCode(gameId).then(setPlayers);
      getAssignableRoles().then(setRoles);
    }
  }, [gameId]);

  // Subscribe to real-time game updates (for phase changes)
  useEffect(() => {
    if (!gameId) return;
    
    // Set initial phase from the game object when it loads
    if (game?.current_phase) {
      setGamePhase(game.current_phase);
    }

    const unsubscribe = subscribeToGameUpdates(gameId, (payload) => {
      if (payload.new && payload.new.current_phase) {
        console.log('Game phase changed to:', payload.new.current_phase);
        setGamePhase(payload.new.current_phase);
      }
    });

    return unsubscribe;
  }, [gameId, game]); // Rerun when the game object itself changes

  // Subscribe to real-time player updates (for role assignments, etc.)
  useEffect(() => {
    if (!gameId) return;

    const unsubscribe = subscribeToPlayerUpdates(gameId, (payload) => {
      // A player has been inserted, updated, or deleted. Refetch the list for all clients.
      console.log('Player data changed, refetching players...');
      getPlayersByGameCode(gameId).then(setPlayers);
    });

    return unsubscribe;
  }, [gameId]); // Only depends on gameId

  // Memoize current player and host status to prevent re-calculations
  const { currentPlayer, isCurrentUserHost } = useMemo(() => {
    const p = players.find((p) => p.player_id === currentPlayerId);
    const isHost = !!(game && p && p.user_id === game.host_user_id);
    return { currentPlayer: p, isCurrentUserHost: isHost };
  }, [players, currentPlayerId, game]);
  
useEffect(() => {
  const handleRoleAssignment = async () => {
    // Check if roles are already assigned
    const rolesAreAssigned = players.some(p => p.current_role_name);
    
    if (isCurrentUserHost && 
        game?.current_phase === 'RoleReveal' && 
        !rolesAreAssigned && 
        !isAssigningRoles) {
      
      setIsAssigningRoles(true);
      console.log("Host is assigning roles via edge function...");
      
      try {
        // Get the current user's ID (the host)
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          console.error("Host user not authenticated");
          setIsAssigningRoles(false);
          return;
        }
        
        // Call the edge function
        const result = await assignRolesToPlayers(gameId, user.id);

        if (result.success) {
          console.log("Roles assigned successfully:", result.assignments);
          // The real-time subscription should automatically update the UI
        } else {
          console.error("Failed to assign roles:", result.error);
          // Optionally show an error message to the user
        }
      } catch (error) {
        console.error("Error during role assignment:", error);
      } finally {
        setIsAssigningRoles(false);
      }
    }
  };
  
  // Ensure we have the necessary data before trying to assign roles
  if (game && players.length > 0 && isCurrentUserHost !== undefined) {
    handleRoleAssignment();
  }
}, [game, players, isCurrentUserHost, gameId, isAssigningRoles]);


  const handleSetGamePhase = async (newPhase: GamePhase) => {
    setGamePhase(newPhase);
    if (!isCurrentUserHost) return;
    try {
      await updateGamePhase(gameId, newPhase);
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
  if (!resultsCalculated && gameId && playerId) {
    setResultsCalculated(true);
    try {
      const results = await calculateMinigameResults(gameId, game?.current_day || 1);
      
      // If host, update the database
      if (isCurrentUserHost) {
        await updateMinigameResults(gameId, results);
      }
      
      // All players find their own result
      const myResult = results.find((r) => r.playerId === playerId);
      setMinigameResult(myResult);
    } catch (error) {
      console.error("Failed to calculate minigame results:", error);
      setResultsCalculated(false);
    }
  }
};

// Add this useEffect to reset the flag when phase changes
useEffect(() => {
  if (gamePhase !== "Reflection_MiniGame_Result") {
    setResultsCalculated(false);
    setMinigameResult(undefined);
  }
}, [gamePhase]);

// Add this useEffect to trigger calculation when entering results phase
useEffect(() => {
  if (gamePhase === "Reflection_MiniGame_Result" && isCurrentUserHost && !resultsCalculated) {
    handleMinigameResult();
  }
}, [gamePhase, resultsCalculated, gameId, playerId, isCurrentUserHost]);



  const renderGameContent = () => {
    const roleName = currentPlayer?.current_role_name || "Assigning...";
    const roleDescription =
      roles.find((r) => r.role_name === roleName)?.description || "Please wait while the host starts the game.";

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
            {gamePhase?.replace(/_/g, " ").toUpperCase()}
          </span>
        </p>
      </header>
      <main className="w-full max-w-3xl">{renderGameContent()}</main>
    </div>
  );
}
