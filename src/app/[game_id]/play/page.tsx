"use client";

import { useParams, useSearchParams, useRouter } from "next/navigation";
import { useState, useMemo, useEffect, Suspense } from "react";
import { useGameContext } from "@/app/[game_id]/layout";
import { GamePhase, Role } from "@/types";
import { getNextPhase } from "@/lib/gameUtils";
import { updateGamePhase, setGameDay, getAssignableRoles } from "@/lib/gameApi";
import { useRoleAssignment } from "@/hooks/useRoleAssignment";
import { useMinigame } from "@/hooks/useMinigame";
import MinigameCore from "@/components/game/MinigameCore";
import ConsultationPhase from "@/components/game/ConsultationPhase";
import ReflectionPhase from "@/components/game/ReflectionPhase";
import OutreachPhase from "@/components/game/OutreachPhase";
import CardReveal from "@/components/game/CardReveal";
import Tutorial from "@/components/game/Tutorial";
import MinigameResults from "@/components/game/MinigameResults";
import ConsultationElections from "@/components/game/Elections";
import ConsultationVoting from "@/components/game/ConsultationVoting";
import ConsultationVotingResults from "@/components/game/ConsultationVotingResults";
import ReflectionPhaseReveal from "@/components/game/ReflectionPhaseReveal";
import { useRoleActions } from "@/hooks/useRoleActions";

export default function GamePlayPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <GamePlayPageInner />
    </Suspense>
  );
}

function GamePlayPageInner() {
  const params = useParams();
  const router = useRouter();
  const { consolidateRoleActions } = useRoleActions();

  const gameId: string = params.game_id as string;

  // Get game data from layout context
  const { game, players, currentPlayerIsHost, playerId } = useGameContext();

  // Game state and hooks
  const gamePhase = game?.current_phase;

  const [roles, setRoles] = useState<Role[]>([]);

  // Memoize current player and host status to prevent re-calculations
  const { currentPlayer } = useMemo(() => {
    const p = players.find((p) => p.player_id === playerId);
    return { currentPlayer: p };
  }, [players, playerId]);

  useEffect(() => {
    getAssignableRoles().then(setRoles);
  }, []);

  // Custom hooks for role assignment
  useRoleAssignment();

  // Custom hooks for minigame logic
  const { minigameResult, handleMinigameGuess } = useMinigame({
    gamePhase,
  });

  const handleSetGamePhase = async (newPhase?: GamePhase) => {
    if (!gamePhase) {
      return;
    }

    const nextPhase = newPhase ?? getNextPhase(gamePhase, game);
    if (!currentPlayerIsHost && game?.treasurer_player_id !== playerId) {
      return;
    }

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
            roleName={roleName}
            roleDescription={roleDescription}
            onNextPhase={() => {
              setGameDay(gameId, 1);
              handleSetGamePhase();
            }}
          />
        );
      case "Tutorial":
        return <Tutorial onNextPhase={() => handleSetGamePhase()} />;
      case "Reflection_RoleActions_Selection":
        return <ReflectionPhase onNextPhase={() => handleSetGamePhase()} />;
      case "Reflection_MiniGame":
        return (
          <MinigameCore
            onGuess={handleMinigameGuess}
            onNextPhase={() => handleSetGamePhase()}
            roles={roles}
          />
        );
      case "Reflection_MiniGame_Result":
        return (
          <MinigameResults
            position={minigameResult?.rank || 0}
            points={minigameResult?.totalPoints || 0}
            onNextPhase={() => handleSetGamePhase()}
          />
        );
      case "Elections_Chairperson":
      case "Elections_Secretary":
      case "Elections_Result":
        return (
          <ConsultationElections
            onNextPhase={() => {
              handleSetGamePhase();
            }}
          />
        );
      case "Reflection_RoleActions_Execution":
        if (currentPlayerIsHost) {
          consolidateRoleActions();
        }
        return (
          <ReflectionPhaseReveal onNextPhase={() => handleSetGamePhase()} />
        );
      case "Outreach":
        return <OutreachPhase onNextPhase={() => handleSetGamePhase()} />;
      case "Consultation_Discussion":
      case "Consultation_TreasurerActions":
        return (
          <ConsultationPhase
            onNextPhase={() => {
              handleSetGamePhase();
            }}
          />
        );
      case "Consultation_Voting":
      case "Consultation_Voting_Count":
        return (
          <ConsultationVoting
            onNextPhase={() => {
              handleSetGamePhase();
            }}
          />
        );
      case "Consultation_Voting_Results":
        return (
          <ConsultationVotingResults
            onNextPhase={() => {
              setGameDay(gameId, (game?.current_day ?? 1) + 1);
              handleSetGamePhase();
            }}
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
