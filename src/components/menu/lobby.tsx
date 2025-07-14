'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";


export default function RoomLobby() {
  const router = useRouter();
  const [roomName, setRoomName] = useState("Vice & Virtue");
  const [outreachPhase, setOutreachPhase] = useState(false);
  const players = ["Player 1", "Player 2", "Player 3"];

  const handleCopy = () => {
    navigator.clipboard.writeText(roomName);
    alert("Room name copied!");
  };

  const handleShare = () => {
    const shareText = `Join my Vice & Virtue game room: ${roomName}`;
    if (navigator.share) {
      navigator.share({ title: "Vice & Virtue", text: shareText });
    } else {
      alert("Sharing not supported on this browser.");
    }
  };

  return (
    <div className="space-y-4 text-center">
      {/* Players */}
      <div className="flex justify-center gap-2">
        {players.map((player, i) => (
          <div key={i} className="flex flex-col items-center">
            <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center text-gray-600">
              👤
            </div>
            <span className="text-xs">{player}</span>
          </div>
        ))}
      </div>

      {/* Room name input */}
      <input
        type="text"
        value={roomName}
        onChange={(e) => setRoomName(e.target.value)}
        className="w-full border rounded px-3 py-2 text-center text-lg font-semibold"
        placeholder="Room name"
      />

      {/* Copy/share */}
      <button
        onClick={handleCopy}
        className="w-full bg-gray-200 py-2 rounded"
      >
        Copy room name
      </button>
      <button
        onClick={handleShare}
        className="w-full bg-gray-300 py-2 rounded"
      >
        Share link
      </button>

      {/* Outreach toggle */}
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">Outreach phase?</span>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            className="sr-only peer"
            checked={outreachPhase}
            onChange={() => setOutreachPhase(!outreachPhase)}
          />
          <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-checked:bg-black rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
        </label>
      </div>

      {/* Start game */}
      <button 
        onClick={() => router.push("/game/reveal")}
        className="w-full border py-2 rounded hover:bg-black hover:text-white transition"
      >
        Start game
      </button>
    </div>
  );
}
