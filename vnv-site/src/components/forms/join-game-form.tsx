"use client";

import { Input } from "@/components/ui/input";

export default function JoinGameForm() {
  return (
    <div>
      <p>Enter game room id:</p>
      <Input placeholder="Room ID" />
    </div>
  );
}
