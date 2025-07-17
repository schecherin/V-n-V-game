"use client";
import React, { useState, JSX, useEffect, useCallback, useRef } from "react";
import { COUNTDOWN_SECONDS, CURRENT_USER_ID } from "@/lib/constants";
import {
  mockPlayers,
  initialRoomName,
  mockUserGameData,
  Player,
  UserGameData,
  PhaseSwitch,
  ActiveView,
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

export default function LobbyPage(): JSX.Element {
  const [players, setPlayers] = useState<Player[]>(mockPlayers);
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

  const router = useRouter();

  const [phaseSwitches, setPhaseSwitches] = useState<PhaseSwitch[]>([
    { id: "outreach", label: "Outreach Phase", checked: true },
    { id: "reflection", label: "Reflection Phase", checked: false },
    { id: "consultation", label: "Consultation Phase", checked: false },
  ]);

  const isCurrentUserHost: boolean =
    players.find((p) => p.id === CURRENT_USER_ID)?.isHost ?? false;

  const handlePlayerClick = (player: Player): void => {
    console.log("Player clicked:", player);
    if (player.id === CURRENT_USER_ID) {
      setPlayers((prevPlayers) =>
        prevPlayers.map((p) =>
          p.id === player.id ? { ...p, isReady: !p.isReady } : p
        )
      );
    }
  };
  const handlePhaseChange = (id: string, value: boolean): void => {
    setPhaseSwitches((prev) =>
      prev.map((ps) => (ps.id === id ? { ...ps, checked: value } : ps))
    );
  };
  const gameId = "TODO: GET GAME ID HERE";
  const handleStartGame = (): void => {
    router.push(`game/${gameId}`);
  };
  const canStartGame: boolean =
    isCurrentUserHost && players.some((p) => p.isReady);

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
              currentUserId={CURRENT_USER_ID}
              onPlayerClick={handlePlayerClick}
            />
            <RoomInfoPanel roomName={roomName} />
          </>
        )}
        {activeMainView === "controls" && (
          <HostControlsPanel
            isHost={isCurrentUserHost}
            onStartGame={handleStartGame}
            canStartGame={canStartGame}
            phaseSwitches={phaseSwitches}
            onPhaseChange={handlePhaseChange}
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
        <p className="text-left whitespace-pre-line">
          {userGameData.roleDescription}
        </p>
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
