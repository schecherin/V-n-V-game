"use client";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import UserButton from "@/components/ui/user-button";
import JoinRoomComponent from "@/components/lobby/JoinRoomComponent";
import CreateRoomComponent from "@/components/lobby/CreateRoomComponent";

export default function MainMenu() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <MainMenuInner />
    </Suspense>
  );
}

function MainMenuInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeComponent, setActiveComponent] = useState<
    "menu" | "join" | "create"
  >("menu");

  // Check for URL parameter and auto-show join component
  useEffect(() => {
    const codeFromUrl = searchParams.get("code");
    if (codeFromUrl) {
      setActiveComponent("join");
    }
  }, [searchParams]);

  const handleBackToMenu = () => {
    setActiveComponent("menu");
  };

  if (activeComponent === "join") {
    return (
      <main className="min-h-screen flex justify-center items-center bg-gray-100 p-4">
        <UserButton />
        <div className="w-full max-w-md">
          <JoinRoomComponent onBack={handleBackToMenu} />
        </div>
      </main>
    );
  }

  if (activeComponent === "create") {
    return (
      <main className="min-h-screen flex justify-center items-center bg-gray-100 p-4">
        <UserButton />
        <div className="w-full max-w-md">
          <CreateRoomComponent onBack={handleBackToMenu} />
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex justify-center items-center bg-gray-100 p-4">
      <UserButton />
      <div className="w-full max-w-xs space-y-6">
        <button
          className="w-full py-3 bg-gray-200 border border-black text-black text-lg rounded hover:bg-gray-300 transition"
          onClick={() => setActiveComponent("join")}
        >
          Join room
        </button>
        <button
          className="w-full py-3 bg-gray-200 border border-black text-black text-lg rounded hover:bg-gray-300 transition"
          onClick={() => setActiveComponent("create")}
        >
          Create room
        </button>
      </div>
    </main>
  );
}
