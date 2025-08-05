"use client";
import React, { useState, JSX, useEffect, Suspense } from "react";
import { initialRoomName } from "@/lib/mockData";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import PlayerListHorizontal from "@/components/lobby/PlayerListHorizontal";
import RoomInfoPanel from "@/components/lobby/RoomInfoPanel";
import HostControlsPanel from "@/components/lobby/HostControlsPanel";
import { useGameContext } from "@/app/[game_id]/layout";

import {
  setGameIncludeOutreachPhase,
  setGameTutorialStatus,
  updateGamePhase,
} from "@/lib/gameApi";
import { Player, GameSwitch } from "@/types";
import PlayerList from "@/components/app/PlayerList";
import { MIN_PLAYERS } from "@/lib/constants";

export default function LobbyPage(): JSX.Element {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LobbyPageInner />
    </Suspense>
  );
}

function LobbyPageInner(): JSX.Element {
  const params = useParams();
  const searchParams = useSearchParams();
  const gameId = params.game_id as string;
  const playerId = searchParams.get("playerId");

  // Get game data from layout context
  const { game, players, currentUserIsHost, activeMainView } = useGameContext();

  const [roomName, setRoomName] = useState<string>(initialRoomName);
  const [shouldRedirect, setShouldRedirect] = useState<boolean>(false);

  const gamePhase = game?.current_phase;
  const router = useRouter();

  // redirect when phase changes
  useEffect(() => {
    if (gamePhase && gamePhase !== "Lobby") {
      // Set flag to redirect instead of calling router directly
      setShouldRedirect(true);
    }
  }, [game]);

  // Handle redirect when phase changes
  useEffect(() => {
    if (shouldRedirect && playerId) {
      router.push(`/${gameId}/play?playerId=${playerId}`);
    }
  }, [shouldRedirect, gameId, playerId, router]);

  const [gameSwitches, setGameSwitches] = useState<GameSwitch[]>([
    { id: "outreach", label: "Outreach Phase", checked: true },
    { id: "tutorial", label: "Tutorial", checked: false },
  ]);

  const handlePlayerClick = (player: Player): void => {
    console.log("Player clicked:", player);
  };

  const handleGameSwitchChange = (id: string, value: boolean): void => {
    setGameSwitches((prev) =>
      prev.map((gs) => (gs.id === id ? { ...gs, checked: value } : gs))
    );
  };

  const handleStartGame = async (): Promise<void> => {
    try {
      // Get the current switch values
      const outreachSwitch = gameSwitches.find((gs) => gs.id === "outreach");
      const tutorialSwitch = gameSwitches.find((gs) => gs.id === "tutorial");

      // Update the database with the switch values
      await setGameIncludeOutreachPhase(
        gameId,
        outreachSwitch?.checked || false
      );
      await setGameTutorialStatus(gameId, tutorialSwitch?.checked || false);

      // Set the game phase to RoleReveal
      await updateGamePhase(gameId, "RoleReveal");
    } catch (error) {
      console.error("Failed to update game settings:", error);
    }
  };

  return (
    <div className="flex flex-col h-screen font-sans bg-cream text-brown-dark overflow-hidden">
      <main className="flex-grow overflow-y-auto pb-16">
        {" "}
        {/* pb-16 makes space for the footer */}
        <PlayerListHorizontal onPlayerClick={handlePlayerClick} />
        <RoomInfoPanel roomName={roomName} />
        {currentUserIsHost && (
          <HostControlsPanel
            onStartGame={handleStartGame}
            canStartGame={currentUserIsHost && players.length >= MIN_PLAYERS}
            gameSwitches={gameSwitches}
            onGameSwitchChange={handleGameSwitchChange}
          />
        )}
      </main>
    </div>
  );
}
