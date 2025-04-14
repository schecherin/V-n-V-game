
'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const [avatar, setAvatar] = useState<string | null>(null);
  const router = useRouter();

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setAvatar(url);
    }
  };

  return (
    <main className="min-h-screen flex justify-center items-center bg-gray-100 p-4">
      <div className="w-full max-w-xs bg-white rounded-lg shadow-md p-4 space-y-6 text-center">
        <h1 className="text-xl font-semibold">Your Profile</h1>

        {/* Profile Picture Upload */}
        <label className="cursor-pointer inline-block">
          <input type="file" accept="image/*" className="hidden" onChange={handleUpload} />
          <div className="w-24 h-24 bg-gray-200 rounded-full overflow-hidden mx-auto flex items-center justify-center">
            {avatar ? (
              <img src={avatar} alt="avatar" className="w-full h-full object-cover" />
            ) : (
              <span className="text-gray-500 text-3xl">👤</span>
            )}
          </div>
          <div className="text-sm mt-2 text-gray-500">Tap to upload</div>
        </label>

        {/* Info */}
        <div className="text-left space-y-1 text-sm text-gray-700">
          <p><strong>Username:</strong> PlayerOne</p>
          <p><strong>Email:</strong> player@example.com</p>
          <p><strong>Gems:</strong> 69</p>
        </div>

        {/* Logout (placeholder) */}
        <button
          className="w-full py-2 border border-red-500 text-red-500 rounded hover:bg-red-500 hover:text-white transition"
          onClick={() => alert("Logout placeholder")}
        >
          Log Out
        </button>

        {/* Go Back */}
        <button
          className="text-xs text-gray-500 underline mt-2"
          onClick={() => router.push("/")}
        >
          ← Back to menu
        </button>
      </div>
    </main>
  );
}
    