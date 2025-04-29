"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { toast } from "sonner";
import { RefreshCcw, Loader, Settings } from "lucide-react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useAtom } from "jotai";
import {
  deckNamesAtom,
  selectedDeckAtom,
  themeAtom,
  wordSelectionModeAtom,
  WordSelectionMode,
} from "@/store/atoms";
import { getDeckNames } from "@/lib/agent";

type Props = {
  i18n: {
    title: string;
    description: string;
    saveButton: string;
    ariaLabel: string;
    locale: {
      title: string;
      en: string;
      ja: string;
    };
    anki: {
      title: string;
      syncButton: string;
      selectDeck: string;
      placeholder: string;
      success: string;
      error: string;
    };
    theme: {
      title: string;
      light: string;
      dark: string;
    };
  };
};

export default function SettingsDialog({ i18n }: Readonly<Props>) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const [deckNames, setDeckNames] = useAtom(deckNamesAtom);
  const [selectedDeck, setSelectedDeck] = useAtom(selectedDeckAtom);
  const [theme, setTheme] = useAtom(themeAtom);
  const [wordSelectionMode, setWordSelectionMode] = useAtom(
    wordSelectionModeAtom
  );

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [tempSelectedDeck, setTempSelectedDeck] = useState(selectedDeck);
  const [tempTheme, setTempTheme] = useState(theme);
  const [tempWordSelectionMode, setTempWordSelectionMode] =
    useState(wordSelectionMode);
  const [isSyncing, setIsSyncing] = useState(false);
  const [selectedLocale, setSelectedLocale] = useState<string>(
    pathname?.split("/")[1] || "en"
  );

  useEffect(() => {
    if (!isSettingsOpen) {
      setTempSelectedDeck(selectedDeck);
      setTempTheme(theme);
      setTempWordSelectionMode(wordSelectionMode);
    }
  }, [isSettingsOpen, selectedDeck, theme, wordSelectionMode]);

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.classList.toggle("dark", theme === "dark");
    }
  }, [theme]);

  async function handleAnkiSync() {
    setIsSyncing(true);
    try {
      const decks = await getDeckNames();
      setDeckNames(decks);
      localStorage.setItem("deckNames", JSON.stringify(decks));
      toast.success(i18n.anki.success, {
        position: "top-center",
      });
    } catch (error) {
      console.error(i18n.anki.error, error);
      toast.error(i18n.anki.error, {
        position: "top-center",
      });
    } finally {
      setIsSyncing(false);
    }
  }

  function handleSave() {
    const queryParams = new URLSearchParams(searchParams?.toString());
    const currentLocale = pathname?.split("/")[1] || "en";

    setSelectedDeck(tempSelectedDeck);
    setTheme(tempTheme);
    setWordSelectionMode(tempWordSelectionMode);
    localStorage.setItem("selectedDeck", tempSelectedDeck);
    localStorage.setItem("theme", tempTheme);
    localStorage.setItem("wordSelectionMode", tempWordSelectionMode);

    setIsSettingsOpen(false);

    if (selectedLocale !== currentLocale) {
      const basePath = `/${selectedLocale}`;
      router.push(
        `${basePath}${pathname?.replace(
          `/${currentLocale}`,
          ""
        )}?${queryParams.toString()}`
      );
    }
  }

  return (
    <Sheet open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
      <SheetTrigger asChild>
        <Button aria-label={i18n.ariaLabel}>
          <Settings className="w-6 h-6" />
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>{i18n.title}</SheetTitle>
          <SheetDescription>{i18n.description}</SheetDescription>
        </SheetHeader>
        <div className="my-4 space-y-4">
          <section>
            <h2 className="text-lg font-medium mb-2">{i18n.theme.title}</h2>
            <Select
              value={tempTheme}
              onValueChange={(value) => setTempTheme(value as "light" | "dark")} // Update temporary theme
            >
              <SelectTrigger>
                <SelectValue placeholder={i18n.theme.title} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">{i18n.theme.light}</SelectItem>
                <SelectItem value="dark">{i18n.theme.dark}</SelectItem>
              </SelectContent>
            </Select>
          </section>

          <section>
            <h2 className="text-lg font-medium mb-2">{i18n.locale.title}</h2>
            <Select value={selectedLocale} onValueChange={setSelectedLocale}>
              <SelectTrigger>
                <SelectValue placeholder={i18n.anki.placeholder} />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(i18n.locale)
                  .filter(([localeKey]) => localeKey !== "title")
                  .map(([localeKey, localeLabel]) => (
                    <SelectItem key={localeKey} value={localeKey}>
                      {localeLabel}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </section>

          <section>
            <h2 className="text-lg font-medium mb-2">Word Selection Mode</h2>
            <Select
              value={tempWordSelectionMode}
              onValueChange={(value) =>
                setTempWordSelectionMode(value as WordSelectionMode)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Mode" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={WordSelectionMode.Override}>
                  Override
                </SelectItem>
                <SelectItem value={WordSelectionMode.Add}>Add On</SelectItem>
              </SelectContent>
            </Select>
          </section>

          <section>
            <h2 className="text-lg font-medium mb-2">{i18n.anki.title}</h2>
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
              {i18n.anki.syncButton}
            </Button>
            {deckNames.length > 0 && (
              <div className="mt-4">
                <p className="text-sm text-gray-500 mb-2">
                  {i18n.anki.selectDeck}
                </p>
                <Select
                  value={tempSelectedDeck}
                  onValueChange={(value) => setTempSelectedDeck(value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={i18n.anki.placeholder} />
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
          <Button onClick={handleSave}>{i18n.saveButton}</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
