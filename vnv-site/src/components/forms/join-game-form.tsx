"use client";

import Link from "next/link";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function JoinGameForm() {
  return (
    <div className="flex flex-row gap-x-4">
      <Input placeholder="Room ID" className="w-[70%]" />
      <Button size="lg" className="w-[30%]" asChild>
        <Link href="/lobby">Join Room</Link>
      </Button>
    </div>
  );
}
