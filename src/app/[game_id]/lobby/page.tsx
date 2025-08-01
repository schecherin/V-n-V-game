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
import { isCurrentUserHost } from "@/lib/gameUtils";

import {
  getGameByCode,
  setGameIncludeOutreachPhase,
  setGameTutorialStatus,
  updateGamePhase,
} from "@/lib/gameApi";
import { Player, GameSwitch, Game } from "@/types";
import {
  subscribeToGameUpdates,
  subscribeToPlayerUpdates,
} from "@/lib/gameSubscriptions";
import { getPlayersByGameCode } from "@/lib/playerApi";

export default function LobbyPage(): JSX.Element {
  const params = useParams();
  const searchParams = useSearchParams();
  const gameId = params.game_id as string;
  const playerId = searchParams.get("playerId");
  const [roomName, setRoomName] = useState<string>(initialRoomName);
  const [isChatOpen, setIsChatOpen] = useState<boolean>(false);
  const [activeMainView, setActiveMainView] = useState<ActiveView>("players");
  const [shouldRedirect, setShouldRedirect] = useState<boolean>(false);
  const [currentUserIsHost, setCurrentUserIsHost] = useState<boolean>(false);

  const [game, setGame] = useState<Game | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const gamePhase = game?.current_phase;
  const router = useRouter();

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

  useEffect(() => {
    setCurrentUserIsHost(isCurrentUserHost(game, playerId));
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
