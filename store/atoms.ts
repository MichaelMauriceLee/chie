import { atom } from "jotai";

export const deckNamesAtom = atom(
  JSON.parse(localStorage.getItem("deckNames") || "[]") as string[]
);

export const selectedDeckAtom = atom(
  localStorage.getItem("selectedDeck") || ""
);
