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
  SheetDescription,
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
import { useTranslations } from "next-intl";

export default function SettingsDialog() {
  const t = useTranslations("SettingsDialog");

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
    setIsSyncing(true);
    try {
      const decks = await getDeckNames();
      setDeckNames(decks);
      localStorage.setItem("deckNames", JSON.stringify(decks));
    } catch (error) {
      console.error(t("error.sync-failed"), error);
    } finally {
      setIsSyncing(false);
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
        <Button aria-label={t("aria.settings")}>
          <Settings className="w-6 h-6" />
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>{t("title")}</SheetTitle>
          <SheetDescription>{t("description")}</SheetDescription>
        </SheetHeader>
        <div className="my-4 space-y-4">
          <section>
            <h2 className="text-lg font-medium mb-2">{t("anki.title")}</h2>
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
              {t("anki.sync-button")}
            </Button>
            {deckNames.length > 0 && (
              <div className="mt-4">
                <p className="text-sm text-gray-500 mb-2">
                  {t("anki.select-deck")}
                </p>
                <Select
                  value={tempSelectedDeck}
                  onValueChange={(value) => setTempSelectedDeck(value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={t("anki.placeholder")} />
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
          <Button onClick={handleSave}>{t("save-button")}</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
