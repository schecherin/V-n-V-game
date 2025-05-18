'use client';

import { useRouter } from "next/navigation";
import UserButton from "@/components/ui/user-button";

export default function MainMenu() {
  const router = useRouter();

  return (
    <main className="min-h-screen flex justify-center items-center bg-gray-100 p-4">
      <UserButton />
      <div className="w-full max-w-xs space-y-6">
        <button
          className="w-full py-3 bg-gray-200 border border-black text-black text-lg rounded"
          onClick={() => console.log("join room")}
        >
          Join room
        </button>
        <button
          className="w-full py-3 bg-gray-200 border border-black text-black text-lg rounded"
          onClick={() => router.push("/game/lobby")}
        >
          Create room
        </button>
      </div>
    </main>
  );
}
