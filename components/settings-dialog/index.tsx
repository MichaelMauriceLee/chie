"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { useAtom } from "jotai";
import { Settings, RefreshCcw, Loader } from "lucide-react";
import { deckNamesAtom, selectedDeckAtom } from "@/store/atoms";
import { getDeckNames } from "@/lib/agent";

export default function SettingsDialog() {
  const [deckNames, setDeckNames] = useAtom(deckNamesAtom);
  const [selectedDeck, setSelectedDeck] = useAtom(selectedDeckAtom);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [tempSelectedDeck, setTempSelectedDeck] = useState(selectedDeck);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    if (!isSettingsOpen) {
      setTempSelectedDeck(selectedDeck);
    }
  }, [isSettingsOpen, selectedDeck]);

  async function handleAnkiSync() {
    setIsSyncing(true); // Start loading
    try {
      const decks = await getDeckNames();
      setDeckNames(decks);
      localStorage.setItem("deckNames", JSON.stringify(decks));
    } catch (error) {
      console.error("Failed to sync with Anki:", error);
    } finally {
      setIsSyncing(false); // Stop loading
    }
  }

  function handleSave() {
    setSelectedDeck(tempSelectedDeck);
    localStorage.setItem("selectedDeck", tempSelectedDeck);
    setIsSettingsOpen(false);
  }

  return (
    <Sheet open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
      <SheetTrigger asChild>
        <Button aria-label="Settings">
          <Settings className="w-6 h-6" />
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Settings</SheetTitle>
        </SheetHeader>
        <div className="my-4 space-y-4">
          <section>
            <h2 className="text-lg font-medium mb-2">Anki</h2>
            <Button
              variant="default"
              onClick={handleAnkiSync}
              disabled={isSyncing}
            >
              {isSyncing ? (
                <Loader className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <RefreshCcw className="w-4 h-4 mr-2" />
              )}
              Sync
            </Button>
            {deckNames.length > 0 && (
              <div className="mt-4">
                <p className="text-sm text-gray-500 mb-2">
                  Select a deck to sync:
                </p>
                <Select
                  value={tempSelectedDeck}
                  onValueChange={(value) => setTempSelectedDeck(value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Choose a deck" />
                  </SelectTrigger>
                  <SelectContent>
                    {deckNames.map((deck) => (
                      <SelectItem key={deck} value={deck}>
                        {deck}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </section>
        </div>
        <SheetFooter>
          <Button onClick={handleSave}>Save</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
