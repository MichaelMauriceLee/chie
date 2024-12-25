"use client";

import ImageArea from "@/components/image-area";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Loader, Send, Settings, Upload } from "lucide-react";
import {
  AudioConfig,
  SpeechConfig,
  SpeechSynthesizer,
} from "microsoft-cognitiveservices-speech-sdk";
import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";

import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

import { getDeckNames } from "@/lib/agent";

type ResponseType = {
  choices: { message: { content: string } }[];
};

type TokenResponse = {
  token: string;
  region: string;
};

export default function Home() {
  const t = useTranslations("Home");

  const [query, setQuery] = useState("");
  const [response, setResponse] = useState<ResponseType | null>(null);
  const [loading, setLoading] = useState(false);
  const [speechConfig, setSpeechConfig] = useState<SpeechConfig | null>(null);
  const [showImageArea, setShowImageArea] = useState(false);
  const [isSettingsDialogOpen, setIsSettingsDialogOpen] = useState(false);
  const [deckNames, setDeckNames] = useState<string[]>([]);

  const [selectedDeck, setSelectedDeck] = useState("");

  async function initializeSpeechSDK() {
    const res = await fetch("/api/speechToken", { method: "POST" });
    const data: TokenResponse = await res.json();
    const speechConfig = SpeechConfig.fromAuthorizationToken(
      data.token,
      data.region
    );
    setSpeechConfig(speechConfig);
  }

  useEffect(() => {
    initializeSpeechSDK();
  }, []);

  async function handleQuerySubmit() {
    if (loading) return;
    setLoading(true);
    const res = await fetch("/api/ask", {
      method: "POST",
      body: JSON.stringify({ query }),
    });
    const data = await res.json();
    const responseContent = data.response.choices[0].message.content;

    const languageMatch = responseContent.match(/Detected Language: (\S+)/);
    if (languageMatch && speechConfig) {
      speechConfig.speechSynthesisLanguage = languageMatch[1];
    }

    setResponse(data.response);
    setLoading(false);
  }

  function processTextForSpeech(text: string): string {
    const match = text.match(/\(([^)]+)\)/);
    if (match) {
      const insideParenthesis = match[1];
      if (insideParenthesis.includes(",")) {
        return insideParenthesis.split(",")[0].trim();
      } else {
        return insideParenthesis.trim();
      }
    }
    return text.split(",")[0].trim();
  }

  function speakText(text: string) {
    if (speechConfig) {
      const audioConfig = AudioConfig.fromDefaultSpeakerOutput();
      const synthesizer = new SpeechSynthesizer(speechConfig, audioConfig);

      const processedText = processTextForSpeech(text);

      synthesizer.speakTextAsync(
        processedText,
        () => {
          synthesizer.close();
        },
        (error) => {
          console.error(error);
          synthesizer.close();
        }
      );
    } else {
      console.error("Speech SDK not initialized");
    }
  }

  function parseResponseContent(content: string) {
    const sections = content.split("\n\n");
    const sentence = sections[0];
    const breakdown = sections.slice(2);
    return { sentence, breakdown };
  }

  function renderWithAudioButtons(text: string) {
    const parts = text.split(/(###.*?###)/g);
    return parts.map((part, index) => {
      if (part.startsWith("###") && part.endsWith("###")) {
        const word = part.slice(3, -3);
        return (
          <span key={index} className="inline-flex items-center gap-1">
            <span>{word}</span>
            <Button onClick={() => speakText(word)}>🔊</Button>
          </span>
        );
      } else {
        return <span key={index}>{part}</span>;
      }
    });
  }

  async function handleSyncAnki() {
    try {
      const decks = await getDeckNames();
      setDeckNames(decks);
    } catch (error) {
      console.error("Error syncing with Anki:", error);
    }
  }

  return (
    <div className="min-h-screen px-10 pt-4 flex flex-col items-start gap-4">
      <h1 className="text-2xl font-bold mb-6">Chie</h1>

      <div className="flex w-full gap-2">
        <Input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t("ask-a-question-placeholder")}
          disabled={loading}
        />
        <Button onClick={handleQuerySubmit} disabled={loading}>
          {loading ? <Loader className="animate-spin" /> : <Send />}
        </Button>
        <Button onClick={() => setShowImageArea(!showImageArea)}>
          <Upload />
        </Button>
        <Button onClick={() => setIsSettingsDialogOpen(true)}>
          <Settings />
        </Button>
      </div>

      {showImageArea && <ImageArea setKeyword={setQuery} />}

      {response && (
        <pre className="whitespace-pre-wrap">
          {(() => {
            const { sentence, breakdown } = parseResponseContent(
              response.choices[0].message.content
            );
            return (
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-2">
                  <p>{renderWithAudioButtons(sentence)}</p>
                </div>

                {breakdown.map((entry, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <p>{renderWithAudioButtons(entry)}</p>
                  </div>
                ))}
              </div>
            );
          })()}
        </pre>
      )}

      <Dialog
        open={isSettingsDialogOpen}
        onOpenChange={(isOpen) => setIsSettingsDialogOpen(isOpen)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Settings</DialogTitle>
          </DialogHeader>
          <section className="mt-4">
            <h2 className="text-lg font-semibold mb-2">Anki Sync</h2>
            <Button variant="default" onClick={handleSyncAnki}>
              Sync
            </Button>
            {deckNames.length > 0 && (
              <div className="mt-4">
                <p className="mb-2 text-sm text-muted-foreground">
                  Select a deck:
                </p>
                <Select
                  value={selectedDeck}
                  onValueChange={(value) => setSelectedDeck(value)}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select a deck" />
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
          <DialogFooter>
            <Button onClick={() => setIsSettingsDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
