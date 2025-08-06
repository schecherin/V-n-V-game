import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const censorList = [
  // English
  "fuck",
  "fuk",
  "shit",
  "damn",
  "hell",
  "dick",
  "cock",
  "piss",
  "crap",
  "arse",
  "ass",
  "twat",
  "wank",
  "slag",
  "slut",
  "fag",
  "tits",
  "boob",
  "porn",
  "nazi",
  "gaza",

  // Dutch
  "kank",
  "kut",
  "tyf",
  "lul",
  "pik",
  "neuk",
  "hoer",
  "suk",
  "mong",
  "kak",
  "bab",
  "nsb",
];
