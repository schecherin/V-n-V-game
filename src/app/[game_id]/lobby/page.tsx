"use client";
import React, { useState, JSX, useEffect, useCallback, useRef } from "react";
import { COUNTDOWN_SECONDS } from "@/lib/constants";
import { initialRoomName, ActiveView } from "@/lib/mockData";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import PlayerListHorizontal from "@/components/lobby/PlayerListHorizontal";
import RoomInfoPanel from "@/components/lobby/RoomInfoPanel";
import HostControlsPanel from "@/components/lobby/HostControlsPanel";
import ChatPanel from "@/components/lobby/ChatPanel";
import BottomNavBar from "@/components/lobby/BottomNavBar";
import { useGame } from "@/hooks/useGame";
import { getPlayersByGameCode } from "@/lib/playerApi";
import { isCurrentUserHost } from "@/lib/gameUtils";
import {
  subscribeToPlayerUpdates,
  subscribeToGameUpdates,
} from "@/lib/gameSubscriptions";
import {
  setGameIncludeOutreachPhase,
  setGameTutorialStatus,
  updateGamePhase,
} from "@/lib/gameApi";
import { Player, GameSwitch } from "@/types";

export default function LobbyPage(): JSX.Element {
  const params = useParams();
  const searchParams = useSearchParams();
  const gameId = params.game_id as string;
  const playerId = searchParams.get("playerId");
  const [players, setPlayers] = useState<Player[]>([]);
  const [roomName, setRoomName] = useState<string>(initialRoomName);
  const [isChatOpen, setIsChatOpen] = useState<boolean>(false);
  const [activeMainView, setActiveMainView] = useState<ActiveView>("players");
  const [shouldRedirect, setShouldRedirect] = useState<boolean>(false);
  const [currentUserIsHost, setCurrentUserIsHost] = useState<boolean>(false);

  const { game, loading, error } = useGame(gameId);
  const router = useRouter();

  useEffect(() => {
    getPlayersByGameCode(gameId).then(setPlayers);
  }, [gameId]);

  // Subscribe to real-time player updates
  useEffect(() => {
    const unsubscribe = subscribeToPlayerUpdates(gameId, (payload) => {
      // Refetch players when any player change occurs (INSERT, UPDATE, DELETE)
      getPlayersByGameCode(gameId).then(setPlayers);
    });
    return unsubscribe;
  }, [gameId]);

  // Subscribe to real-time game updates to redirect when phase changes
  useEffect(() => {
    const unsubscribe = subscribeToGameUpdates(gameId, (payload) => {
      if (
        payload.new &&
        payload.new.current_phase &&
        payload.new.current_phase !== "Lobby"
      ) {
        // Set flag to redirect instead of calling router directly
        setShouldRedirect(true);
      }
    });
    return unsubscribe;
  }, [gameId]);

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

  useEffect(() => {
    setCurrentUserIsHost(isCurrentUserHost(game, playerId));
    console.log("currentUserIsHost", currentUserIsHost);
  }, [game, playerId]);

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
  const canStartGame: boolean = currentUserIsHost;

  return (
    <div className="flex flex-col h-screen font-sans bg-cream text-brown-dark overflow-hidden">
      <main className="flex-grow overflow-y-auto pb-16">
        {" "}
        {/* pb-16 makes space for the footer */}
        {activeMainView === "players" && (
          <>
            <PlayerListHorizontal
              players={players}
              currentUserId={playerId}
              onPlayerClick={handlePlayerClick}
              isHost={currentUserIsHost}
            />
            <RoomInfoPanel roomName={roomName} />
          </>
        )}
        {activeMainView === "controls" && currentUserIsHost && (
          <HostControlsPanel
            isHost={currentUserIsHost}
            onStartGame={handleStartGame}
            canStartGame={canStartGame}
            gameSwitches={gameSwitches}
            onGameSwitchChange={handleGameSwitchChange}
          />
        )}
      </main>

      <BottomNavBar
        onToggleChat={() => {
          setIsChatOpen((prev) => !prev);
        }}
        onTogglePlayers={() => {
          setActiveMainView("players");
          setIsChatOpen(false);
        }}
        onToggleControls={() => {
          setActiveMainView("controls");
          setIsChatOpen(false);
        }}
        activeView={activeMainView}
        chatOpen={isChatOpen}
        showControls={currentUserIsHost}
      />

      <ChatPanel isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
    </div>
  );
}
