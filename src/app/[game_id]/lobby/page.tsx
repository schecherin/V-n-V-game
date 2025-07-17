"use client";
import React, { useState, JSX, useEffect, useCallback, useRef } from "react";
import { COUNTDOWN_SECONDS } from "@/lib/constants";
import {
  initialRoomName,
  UserGameData,
  ActiveView,
  mockUserGameData,
} from "@/lib/mockData";
import { useRouter } from "next/navigation";
import Modal from "@/components/ui/Modal";
import MobileHeader from "@/components/lobby/MobileHeader";
import PlayerListHorizontal from "@/components/lobby/PlayerListHorizontal";
import RoomInfoPanel from "@/components/lobby/RoomInfoPanel";
import HostControlsPanel from "@/components/lobby/HostControlsPanel";
import ChatPanel from "@/components/lobby/ChatPanel";
import BottomNavBar from "@/components/lobby/BottomNavBar";
import SideMenu from "@/components/lobby/SideMenu";
import Button from "@/components/ui/Button";
import { useParams, useSearchParams } from "next/navigation";
import { useGame } from "@/hooks/useGame";
import { getPlayersByGameCode, isCurrentUserHost } from "@/lib/playerApi";
import {
  setGameIncludeOutreachPhase,
  setGameTutorialStatus,
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
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const [activeMainView, setActiveMainView] = useState<ActiveView>("players");
  const [userGameData, setUserGameData] =
    useState<UserGameData>(mockUserGameData);
  const [showLeaveConfirmModal, setShowLeaveConfirmModal] =
    useState<boolean>(false);
  const [showRoleExplanationModal, setShowRoleExplanationModal] =
    useState<boolean>(false);

  const { game, loading, error } = useGame(gameId);

  useEffect(() => {
    getPlayersByGameCode(gameId).then(setPlayers);
  }, [gameId]);

  const router = useRouter();

  const [gameSwitches, setGameSwitches] = useState<GameSwitch[]>([
    { id: "outreach", label: "Outreach Phase", checked: true },
    { id: "tutorial", label: "Tutorial", checked: false },
  ]);

  const currentUserIsHost: boolean = isCurrentUserHost(game, players, playerId);

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

      // Navigate to the play page
      router.push(`/${gameId}/play`);
    } catch (error) {
      console.error("Failed to update game settings:", error);
      // Optionally show an error message to the user
    }
  };
  const canStartGame: boolean = currentUserIsHost;

  const handleLeaveGame = (): void => {
    setShowLeaveConfirmModal(false);
    router.push("/");
  };

  const handleShowRoleExplanation = (): void => {
    setShowRoleExplanationModal(true);
  };

  return (
    <div className="flex flex-col h-screen font-sans bg-cream text-brown-dark overflow-hidden">
      <MobileHeader
        roomName={roomName}
        onOpenMenu={() => setIsMenuOpen(true)}
      />

      <main className="flex-grow overflow-y-auto pb-16">
        {" "}
        {/* pb-16 makes space for the footer */}
        {activeMainView === "players" && (
          <>
            <PlayerListHorizontal
              players={players}
              currentUserId={playerId}
              onPlayerClick={handlePlayerClick}
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
      <SideMenu
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        userGameData={userGameData}
        onLeaveGameConfirm={() => setShowLeaveConfirmModal(true)}
        onShowRoleExplanation={handleShowRoleExplanation}
      />

      <Modal
        isOpen={showLeaveConfirmModal}
        onClose={() => setShowLeaveConfirmModal(false)}
        title="Leave Game"
      >
        <p>Are you sure you want to leave the game?</p>
        <div className="mt-6 flex justify-center space-x-3">
          <Button
            variant="outline"
            onClick={() => setShowLeaveConfirmModal(false)}
            className="px-6"
          >
            No
          </Button>
          <Button
            variant="destructive"
            onClick={handleLeaveGame}
            className="px-6"
          >
            Yes, Leave
          </Button>
        </div>
      </Modal>

      <Modal
        isOpen={showRoleExplanationModal}
        onClose={() => setShowRoleExplanationModal(false)}
        title={`Your Role: ${userGameData.role}`}
      >
        <p className="text-left whitespace-pre-line">{"roleDescription"}</p>
        <div className="mt-6 flex justify-end">
          <Button
            variant="default"
            onClick={() => setShowRoleExplanationModal(false)}
          >
            Got it
          </Button>
        </div>
      </Modal>
    </div>
  );
}
