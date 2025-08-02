"use client";

import React, {
  useEffect,
  useState,
  useCallback,
  useMemo,
  createContext,
  useContext,
  Suspense,
} from "react";
import MobileHeader from "@/components/app/MobileHeader";
import SideMenu from "@/components/app/SideMenu";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { getPlayersByGameCode } from "@/lib/playerApi";
import { getAssignableRoles, getGameByCode } from "@/lib/gameApi";
import { isCurrentPlayerHost } from "@/lib/gameUtils";
import { Player, Game, Role } from "@/types";
import {
  subscribeToGameUpdates,
  subscribeToPlayerUpdates,
} from "@/lib/gameSubscriptions";
import BottomNavBar from "@/components/app/BottomNavBar";
import ChatPanel from "@/components/app/ChatPanel";
import PlayerListDrawer from "@/components/app/PlayerList";

interface GameContextType {
  game: Game | null;
  players: Player[];
  currentPlayerIsHost: boolean;
  playerId: string | null;
  gameId: string;
  refetchData: () => Promise<void>;
  activeMainView: ActiveView;
  setActiveMainView: (view: ActiveView) => void;
  isPlayerListOpen: boolean;
  setIsPlayerListOpen: (open: boolean) => void;
}

const GameContext = createContext<GameContextType | null>(null);
export type ActiveView = "players" | "controls" | "game";

export const useGameContext = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error("useGameContext must be used within a GameLayout");
  }
  return context;
};

export default function GameLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <GameLayoutInner>{children}</GameLayoutInner>
    </Suspense>
  );
}

function GameLayoutInner({ children }: { children: React.ReactNode }) {
  const params = useParams();
  const searchParams = useSearchParams();
  const gameId = params.game_id as string;
  const playerId = searchParams.get("playerId");

  // Game and player state
  const [game, setGame] = useState<Game | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [currentPlayerIsHost, setCurrentPlayerIsHost] =
    useState<boolean>(false);

  // UI state
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const [isChatOpen, setIsChatOpen] = useState<boolean>(false);
  const [isPlayerListOpen, setIsPlayerListOpen] = useState<boolean>(false);
  const [activeMainView, setActiveMainView] = useState<ActiveView>("game");
  const [roomName, setRoomName] = useState<string>(
    "Vice & Virtue - Room " + gameId
  );
  const [showLeaveConfirmModal, setShowLeaveConfirmModal] =
    useState<boolean>(false);
  const [showRoleExplanationModal, setShowRoleExplanationModal] =
    useState<boolean>(false);

  const router = useRouter();

  // Create userGameData from current player info
  const currentPlayer = players.find((p) => p.player_id === playerId);

  // Memoized refetch function
  const refetchData = useCallback(async () => {
    try {
      const [gameData, playersData, rolesData] = await Promise.all([
        getGameByCode(gameId),
        getPlayersByGameCode(gameId),
        getAssignableRoles(),
      ]);
      setGame(gameData);
      setPlayers(playersData);
      setRoles(rolesData);
    } catch (err) {
      console.error("[layout] Error re-fetching game and players:", err);
    }
  }, [gameId]);

  // Initial data fetch
  useEffect(() => {
    if (gameId) {
      refetchData();
    }
  }, [refetchData]);

  // Set up subscriptions
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
            "[layout] Error re-fetching players on Realtime update:",
            err
          );
        });
    });

    return () => {
      unsubscribeGame();
      unsubscribePlayers();
    };
  }, [gameId]);

  // Update host status when game or playerId changes
  useEffect(() => {
    setCurrentPlayerIsHost(isCurrentPlayerHost(game, playerId));
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

  // Create context value
  const contextValue: GameContextType = useMemo(
    () => ({
      game,
      players,
      currentPlayerIsHost,
      playerId,
      gameId,
      refetchData,
      activeMainView,
      setActiveMainView,
      isPlayerListOpen,
      setIsPlayerListOpen,
    }),
    [
      game,
      players,
      currentPlayerIsHost,
      playerId,
      gameId,
      refetchData,
      activeMainView,
      setActiveMainView,
      isPlayerListOpen,
      setIsPlayerListOpen,
    ]
  );

  return (
    <GameContext.Provider value={contextValue}>
      <div className="min-h-screen bg-cream">
        <MobileHeader roomName={roomName} onOpenMenu={handleOpenMenu} />
        {children}

        <SideMenu
          isOpen={isMenuOpen}
          onClose={() => setIsMenuOpen(false)}
          onLeaveGameConfirm={() => setShowLeaveConfirmModal(true)}
          onShowRoleExplanation={handleShowRoleExplanation}
        />
        <BottomNavBar
          onToggleChat={() => {
            setIsChatOpen((prev) => !prev);
          }}
          onTogglePlayers={() => {
            setIsPlayerListOpen((prev) => !prev);
            setIsChatOpen(false);
          }}
          onToggleControls={() => {
            setActiveMainView("controls");
            setIsChatOpen(false);
          }}
          onToggleGame={() => {
            setActiveMainView("game");
            setIsChatOpen(false);
          }}
          gamePhase={game?.current_phase ?? "Lobby"}
          activeView={activeMainView}
          chatOpen={isChatOpen}
          showControls={currentPlayerIsHost}
        />
        <PlayerListDrawer
          isOpen={isPlayerListOpen}
          onClose={() => setIsPlayerListOpen(false)}
        />

        <ChatPanel isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />

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
          title={`Your Role: ${currentPlayer?.current_role_name}`}
        >
          <p className="text-left whitespace-pre-line">
            {roles.find((r) => r.role_name === currentPlayer?.current_role_name)
              ?.description ?? "Please wait for your role to be revealed"}
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
    </GameContext.Provider>
  );
}
