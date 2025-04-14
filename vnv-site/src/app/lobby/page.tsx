'use client';

import RoomLobby from "@/components/menu/lobby";
import UserButton from "@/components/ui/user-button";
import { useRouter } from "next/navigation";

export default function LobbyPage() {
  const router = useRouter();

  return (
    <main className="relative min-h-screen p-4 bg-gray-100 font-sans flex justify-center items-center">
      <UserButton />

      {/* Main lobby UI */}
      <div className="w-full max-w-xs bg-white rounded-lg shadow-md p-4 space-y-4">
        <RoomLobby />
      </div>

      {/* Leave Room Button - bottom-left */}
      <button
        onClick={() => router.push("/")}
        className="absolute bottom-4 left-4 text-sm text-gray-500 hover:underline"
      >
        ← Leave room
      </button>
    </main>
  );
}
