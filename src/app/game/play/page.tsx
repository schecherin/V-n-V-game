"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import MinigameCore from "@/components/game/MinigameCore"; // Adjust path if needed
import ConsultationPhase from "@/components/game/ConsultationPhase";
import ReflectionPhase from "@/components/game/ReflectionPhase";

// Mock player data type for the game
export interface GamePlayer {
  id: string;
  name: string;
  avatar?: string;
  isTargetable?: boolean;
  role?: string; // For backend to know, not shown to others unless revealed
  points: number;
}

export default function GamePlayPage() {
  const params = useParams();
  const router = useRouter();
  const gameId = 1; //params.gameId as string;

  // State for game players
  // BACKEND INTEGRATION: Fetch from backend, update via WebSockets
  const [players, setPlayers] = useState<GamePlayer[]>([
    {
      id: "1",
      name: "Alice",
      avatar: "https://placehold.co/100x100/E63946/white?text=A",
      role: "Murder",
      points: 0,
    },
    {
      id: "2",
      name: "Bob",
      avatar: "https://placehold.co/100x100/F4A261/white?text=B",
      role: "Empathy",
      points: 0,
    },
    {
      id: "3",
      name: "Charlie",
      avatar: "https://placehold.co/100x100/2A9D8F/white?text=C",
      role: "Justice",
      points: 0,
    },
    {
      id: "4",
      name: "David",
      avatar: "https://placehold.co/100x100/264653/white?text=D",
      role: "Torment",
      points: 0,
    },
    {
      id: "5",
      name: "Eve",
      avatar: "https://placehold.co/100x100/E9C46A/white?text=E",
      role: "Virtue Seeker",
      points: 0,
    },
  ]);

  // Current player - normally from auth context
  // For demo, assume player '1' (Alice) is the current player
  const [currentPlayerId, setCurrentPlayerId] = useState<string>("1");
  const [gamePhase, setGamePhase] = useState<
    "minigame" | "reflection" | "consultation" | "ended"
  >("minigame"); // Example phase

  useEffect(() => {
    // BACKEND INTEGRATION:
    // 1. Fetch current game state for gameId (players, current phase...).
    // 2. Establish Socket connection
    // console.log(`Fetching game data for game: ${gameId}`);
    // If players list needs to be dynamic (e.g. based on who was in lobby):
    // const fetchGameData = async () => {
    //   // const response = await fetch(`/api/game/${gameId}/state`);
    //   // const data = await response.json();
    //   // setPlayers(data.players);
    //   // setCurrentPlayerId(data.currentPlayerId); // From session/auth
    //   // setGamePhase(data.currentPhase);
    // };
    // fetchGameData();
  }, [gameId]);

  const handleMinigameGuess = (targetPlayerId: string, guessedRole: string) => {
    console.log(
      `Player ${currentPlayerId} guessed ${targetPlayerId} is ${guessedRole}`
    );
    // BACKEND INTEGRATION:
    // 1. Send this guess to the backend.
    // 2. Backend validates, scores, and sends update.
    // 3. MinigameCore handles local feedback.
  };

  const renderGameContent = () => {
    switch (gamePhase) {
      case "minigame":
        return (
          <MinigameCore
            players={players}
            currentPlayerId={currentPlayerId}
            onGuess={handleMinigameGuess}
            maxGuesses={3}
            setGamePhase={setGamePhase}
          />
        );
      case "reflection":
        return (
          <ReflectionPhase
            player={players.find((p) => p.id === currentPlayerId)}
            setGamePhase={setGamePhase}
          />
        );
          />
        );
      case "consultation":
        return (
          <ConsultationPhase
            player={players.find((p) => p.id === currentPlayerId)}
            setGamePhase={setGamePhase}
          />
        );
      case "ended":
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

  if (!gameId) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">
        Loading game...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[rgb(255,255,255)] to-slate-800 text-white p-4 sm:p-8 flex flex-col items-center justify-center font-sans">
      <header className="w-full max-w-4xl mb-8 text-center">
        <h1 className="text-3xl sm:text-4xl font-bold text-slate-900">
          Vices & Virtues
        </h1>
        <p className="text-md text-slate-900 mt-1">
          Game ID:{" "}
          <span className="font-semibold text-amber-400">{gameId}</span> -
          Phase:{" "}
          <span className="font-semibold text-green-400">
            {gamePhase.toUpperCase()}
          </span>
        </p>
      </header>

      <main className="w-full max-w-3xl">{renderGameContent()}</main>

      <button
        onClick={() => router.push(`/game/lobby`)}
        className="mt-8 px-6 py-2 bg-sky-600 hover:bg-sky-500 text-white font-semibold rounded-lg shadow-md transition duration-200"
      >
        Back to Lobby
      </button>
    </div>
  );
}
