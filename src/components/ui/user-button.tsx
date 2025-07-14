'use client';

import { useRouter } from "next/navigation";

export default function UserButton() {
  const router = useRouter();

  return (
    <div className="absolute top-4 right-4">
      <button
        onClick={() => router.push("/profile")}
        className="text-sm text-gray-1000 hover:underline"
      >
        👤 Account
      </button>
    </div>
  );
}