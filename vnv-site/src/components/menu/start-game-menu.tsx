"use client";

import Link from "next/link";

import JoinGameForm from "@/components/forms/join-game-form";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function StartGameMenu() {
  return (
    <Card className="w-96">
      <CardContent className="space-y-6">
        <JoinGameForm />
        <Button size="lg" className="w-full" asChild>
          <Link href="/lobby">Create Room</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
