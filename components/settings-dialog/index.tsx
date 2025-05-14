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
import { getDeckNames } from "@/lib/agent";
import { WordSelectionMode, wordSelectionModeAtom } from "@/store/atoms";
import { useAtom } from "jotai";

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
      "zh-CN": string;
      "zh-TW": string;
    };
    anki: {
      title: string;
      syncButton: string;
      selectDeck: string;
      placeholder: string;
      success: string;
      error: string;
    };
    wordSelectionMode: {
      title: string;
      override: string;
      addOn: string;
    };
    theme: {
      title: string;
      light: string;
      dark: string;
    };
    dictionaryTargetLanguage: {
      title: string;
      auto: string;
      en: string;
      ja: string;
      "zh-CN": string;
      "zh-TW": string;
    };
    japanesePronunciationStyle: {
      title: string;
      romaji: string;
      hiraganaKatakana: string;
    };
  };
};

export default function SettingsDialog({ i18n }: Readonly<Props>) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const [deckNames, setDeckNames] = useState<string[]>([]);
  const [tempSelectedDeck, setTempSelectedDeck] = useState<string>("");
  const [tempTheme, setTempTheme] = useState<"light" | "dark">("light");
  const [wordSelectionMode, setWordSelectionMode] = useAtom(wordSelectionModeAtom);
  const [tempDictLang, setTempDictLang] = useState("auto");
  const [tempJPStyle, setTempJPStyle] = useState("romaji");
  const [isSyncing, setIsSyncing] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [selectedLocale, setSelectedLocale] = useState<string>(
    pathname?.split("/")[1] || "en"
  );

  useEffect(() => {
    if (!isSettingsOpen) {
      setTempSelectedDeck(localStorage.getItem("selectedDeck") ?? "");
      setTempTheme(
        (localStorage.getItem("theme") as "light" | "dark") || "light"
      );
      const storedMode = localStorage.getItem("wordSelectionMode");
      setWordSelectionMode(
        storedMode === "override" ? WordSelectionMode.Override : WordSelectionMode.Add
      );
      setTempDictLang(
        localStorage.getItem("dictionaryTargetLanguage") ?? "auto"
      );
      setTempJPStyle(
        localStorage.getItem("japanesePronunciationStyle") ?? "romaji"
      );
    }
  }, [isSettingsOpen, setWordSelectionMode]);

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.classList.toggle("dark", tempTheme === "dark");
    }
  }, [tempTheme]);

  async function handleAnkiSync() {
    setIsSyncing(true);
    try {
      const decks = await getDeckNames();
      setDeckNames(decks);
      localStorage.setItem("deckNames", JSON.stringify(decks));
      toast.success(i18n.anki.success, { position: "top-center" });
    } catch (error) {
      console.error(i18n.anki.error, error);
      toast.error(i18n.anki.error, { position: "top-center" });
    } finally {
      setIsSyncing(false);
    }
  }

  function handleSave() {
    const queryParams = new URLSearchParams(searchParams?.toString());
    const currentLocale = pathname?.split("/")[1] || "en";

    localStorage.setItem("selectedDeck", tempSelectedDeck);
    localStorage.setItem("theme", tempTheme);
    localStorage.setItem("wordSelectionMode", wordSelectionMode);
    localStorage.setItem("dictionaryTargetLanguage", tempDictLang);

    if (tempDictLang === "ja") {
      localStorage.setItem("japanesePronunciationStyle", tempJPStyle);
      queryParams.set("jpStyle", tempJPStyle);
    } else {
      queryParams.delete("jpStyle");
    }

    queryParams.set("targetLang", tempDictLang);

    setIsSettingsOpen(false);

    const basePath = `/${selectedLocale}`;
    router.push(
      `${basePath}${pathname?.replace(
        `/${currentLocale}`,
        ""
      )}?${queryParams.toString()}`
    );
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
              onValueChange={(v) => setTempTheme(v as "light" | "dark")}
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
                  .filter(([k]) => k !== "title")
                  .map(([k, v]) => (
                    <SelectItem key={k} value={k}>
                      {v}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </section>

          <section>
            <h2 className="text-lg font-medium mb-2">
              {i18n.dictionaryTargetLanguage.title}
            </h2>
            <Select value={tempDictLang} onValueChange={setTempDictLang}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="auto">
                  {i18n.dictionaryTargetLanguage.auto}
                </SelectItem>
                <SelectItem value="en">
                  {i18n.dictionaryTargetLanguage.en}
                </SelectItem>
                <SelectItem value="ja">
                  {i18n.dictionaryTargetLanguage.ja}
                </SelectItem>
                <SelectItem value="zh-CN">
                  {i18n.dictionaryTargetLanguage["zh-CN"]}
                </SelectItem>
                <SelectItem value="zh-TW">
                  {i18n.dictionaryTargetLanguage["zh-TW"]}
                </SelectItem>
              </SelectContent>
            </Select>
          </section>

          {tempDictLang === "ja" && (
            <section>
              <h2 className="text-lg font-medium mb-2">
                {i18n.japanesePronunciationStyle.title}
              </h2>
              <Select
                value={tempJPStyle}
                onValueChange={(v) =>
                  setTempJPStyle(v as "romaji" | "hiragana-katakana")
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="romaji">
                    {i18n.japanesePronunciationStyle.romaji}
                  </SelectItem>
                  <SelectItem value="hiragana-katakana">
                    {i18n.japanesePronunciationStyle.hiraganaKatakana}
                  </SelectItem>
                </SelectContent>
              </Select>
            </section>
          )}

          <section>
            <h2 className="text-lg font-medium mb-2">
              {i18n.wordSelectionMode.title}
            </h2>
            <Select
              value={wordSelectionMode}
              onValueChange={(v) => setWordSelectionMode(v as WordSelectionMode)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Mode" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={WordSelectionMode.Override}>
                  {i18n.wordSelectionMode.override}
                </SelectItem>
                <SelectItem value={WordSelectionMode.Add}>
                  {i18n.wordSelectionMode.addOn}
                </SelectItem>
              </SelectContent>
            </Select>
          </section>

          <section>
            <h2 className="text-lg font-medium mb-2">{i18n.anki.title}</h2>
            <Button onClick={handleAnkiSync} disabled={isSyncing}>
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
                  onValueChange={setTempSelectedDeck}
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
