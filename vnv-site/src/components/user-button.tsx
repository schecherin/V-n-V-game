"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

export default function UserButton() {
  const router = useRouter();

  return (
    <div className="absolute top-4 right-4">
      {/* When signed in, render, otherwise cta link to sign up page */}
      {true ? (
        <DropdownMenu>
          <DropdownMenuTrigger>
            <Avatar className="w-10 h-10">
              <AvatarImage src="User image source" />
              <AvatarFallback className="bg-green-700 text-gray-100">
                AS
              </AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => {
                router.push("/profile");
              }}
            >
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-destructive"
              onClick={() => {
                console.log("Sign Out");
              }}
            >
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        <Button asChild>
          <Link href="/sign-up">Sign Up</Link>
        </Button>
      )}
    </div>
  );
}
