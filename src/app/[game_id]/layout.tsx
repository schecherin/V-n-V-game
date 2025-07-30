"use client";

import React, { useEffect, useState } from "react";
import MobileHeader from "@/components/lobby/MobileHeader";
import SideMenu from "@/components/lobby/SideMenu";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { useGame } from "@/hooks/useGame";
import { getPlayersByGameCode } from "@/lib/playerApi";
import { isCurrentUserHost } from "@/lib/gameUtils";
import { Player } from "@/types";
import { UserGameData, mockUserGameData } from "@/lib/mockData";

export default function GameLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const params = useParams();
  const searchParams = useSearchParams();
  const gameId = params.game_id as string;
  const playerId = searchParams.get("playerId");

  const { game } = useGame(gameId);
  const [players, setPlayers] = useState<Player[]>([]);
  const [currentUserIsHost, setCurrentUserIsHost] = useState<boolean>(false);
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const [roomName, setRoomName] = useState<string>(
    "Vice & Virtue - Room " + gameId
  );
  const [userGameData, setUserGameData] =
    useState<UserGameData>(mockUserGameData);
  const [showLeaveConfirmModal, setShowLeaveConfirmModal] =
    useState<boolean>(false);
  const [showRoleExplanationModal, setShowRoleExplanationModal] =
    useState<boolean>(false);

  const router = useRouter();

  useEffect(() => {
    if (gameId) {
      getPlayersByGameCode(gameId).then(setPlayers);
    }
  }, [gameId]);

  useEffect(() => {
    setCurrentUserIsHost(isCurrentUserHost(game, playerId));
  }, [game, playerId]);

  const handleOpenMenu = () => {
    setIsMenuOpen(true);
  };

  const handleLeaveGame = (): void => {
    router.push("/");
  };

  const handleShowRoleExplanation = (): void => {
    setShowRoleExplanationModal(true);
  };

  return (
    <div className="min-h-screen bg-cream">
      <MobileHeader roomName={roomName} onOpenMenu={handleOpenMenu} />
      {children}

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
