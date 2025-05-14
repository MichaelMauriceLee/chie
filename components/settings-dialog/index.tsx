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
    displayLanguage: {
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
      "zh-MN": string;
      "zh-CT": string;
    };
    japanesePronunciationStyle: {
      title: string;
      romaji: string;
      hiraganaKatakana: string;
    };
  };
};

type SettingSectionProps = {
  title: string;
  children: React.ReactNode;
};

const SettingSection = ({ title, children }: SettingSectionProps) => (
  <section>
    <h2 className="text-lg font-medium mb-2">{title}</h2>
    {children}
  </section>
);

type SettingSelectProps<T extends string> = {
  value: T;
  onValueChange: (value: T) => void;
  placeholder?: string;
  options: { value: T; label: string }[];
};

const SettingSelect = <T extends string>({
  value,
  onValueChange,
  placeholder,
  options,
}: SettingSelectProps<T>) => (
  <Select value={value} onValueChange={onValueChange}>
    <SelectTrigger>
      <SelectValue placeholder={placeholder} />
    </SelectTrigger>
    <SelectContent>
      {options.map(({ value, label }) => (
        <SelectItem key={value} value={value}>
          {label}
        </SelectItem>
      ))}
    </SelectContent>
  </Select>
);

export default function SettingsDialog({ i18n }: Readonly<Props>) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const [deckNames, setDeckNames] = useState<string[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [wordSelectionMode, setWordSelectionMode] = useAtom(wordSelectionModeAtom);

  const [settings, setSettings] = useState({
    selectedDeck: localStorage.getItem("selectedDeck") ?? "",
    theme: (localStorage.getItem("theme") as "light" | "dark") || "light",
    dictionaryTargetLanguage: localStorage.getItem("dictionaryTargetLanguage") ?? "auto",
    japanesePronunciationStyle: localStorage.getItem("japanesePronunciationStyle") ?? "romaji",
    locale: pathname?.split("/")[1] || "en"
  });

  useEffect(() => {
    if (!isSettingsOpen) {
      setSettings({
        selectedDeck: localStorage.getItem("selectedDeck") ?? "",
        theme: (localStorage.getItem("theme") as "light" | "dark") || "light",
        dictionaryTargetLanguage: localStorage.getItem("dictionaryTargetLanguage") ?? "auto",
        japanesePronunciationStyle: localStorage.getItem("japanesePronunciationStyle") ?? "romaji",
        locale: pathname?.split("/")[1] || "en"
      });
    }
  }, [isSettingsOpen, pathname]);

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.classList.toggle("dark", settings.theme === "dark");
    }
  }, [settings.theme]);

  const updateSetting = <K extends keyof typeof settings>(key: K, value: typeof settings[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

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

    Object.entries(settings).forEach(([key, value]) => {
      localStorage.setItem(key, value.toString());
    });
    localStorage.setItem("wordSelectionMode", wordSelectionMode);

    if (settings.dictionaryTargetLanguage === "ja") {
      queryParams.set("jpStyle", settings.japanesePronunciationStyle);
    } else {
      queryParams.delete("jpStyle");
    }

    queryParams.set("targetLang", settings.dictionaryTargetLanguage);
    setIsSettingsOpen(false);

    const basePath = `/${settings.locale}`;
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
          <SettingSection title={i18n.theme.title}>
            <SettingSelect
              value={settings.theme}
              onValueChange={(v) => updateSetting("theme", v as "light" | "dark")}
              options={[
                { value: "light", label: i18n.theme.light },
                { value: "dark", label: i18n.theme.dark }
              ]}
            />
          </SettingSection>

          <SettingSection title={i18n.displayLanguage.title}>
            <SettingSelect
              value={settings.locale}
              onValueChange={(v) => updateSetting("locale", v)}
              options={Object.entries(i18n.displayLanguage)
                .filter(([k]) => k !== "title")
                .map(([k, v]) => ({ value: k, label: v }))}
            />
          </SettingSection>

          <SettingSection title={i18n.dictionaryTargetLanguage.title}>
            <SettingSelect
              value={settings.dictionaryTargetLanguage}
              onValueChange={(v) => updateSetting("dictionaryTargetLanguage", v)}
              options={[
                { value: "auto", label: i18n.dictionaryTargetLanguage.auto },
                { value: "en", label: i18n.dictionaryTargetLanguage.en },
                { value: "ja", label: i18n.dictionaryTargetLanguage.ja },
                { value: "zh-MN", label: i18n.dictionaryTargetLanguage["zh-MN"] },
                { value: "zh-CT", label: i18n.dictionaryTargetLanguage["zh-CT"] }
              ]}
            />
          </SettingSection>

          {settings.dictionaryTargetLanguage === "ja" && (
            <SettingSection title={i18n.japanesePronunciationStyle.title}>
              <SettingSelect
                value={settings.japanesePronunciationStyle}
                onValueChange={(v) => updateSetting("japanesePronunciationStyle", v)}
                options={[
                  { value: "romaji", label: i18n.japanesePronunciationStyle.romaji },
                  { value: "hiragana-katakana", label: i18n.japanesePronunciationStyle.hiraganaKatakana }
                ]}
              />
            </SettingSection>
          )}

          <SettingSection title={i18n.wordSelectionMode.title}>
            <SettingSelect
              value={wordSelectionMode}
              onValueChange={(v) => setWordSelectionMode(v as WordSelectionMode)}
              options={[
                { value: WordSelectionMode.Override, label: i18n.wordSelectionMode.override },
                { value: WordSelectionMode.Add, label: i18n.wordSelectionMode.addOn }
              ]}
            />
          </SettingSection>

          <SettingSection title={i18n.anki.title}>
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
                <SettingSelect
                  value={settings.selectedDeck}
                  onValueChange={(v) => updateSetting("selectedDeck", v)}
                  placeholder={i18n.anki.placeholder}
                  options={deckNames.map(deck => ({ value: deck, label: deck }))}
                />
              </div>
            )}
          </SettingSection>
        </div>

        <SheetFooter>
          <Button onClick={handleSave}>{i18n.saveButton}</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
