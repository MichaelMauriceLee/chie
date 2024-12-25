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
import { Loader, Send, Settings, Upload, X } from "lucide-react";
import {
  AudioConfig,
  SpeechConfig,
  SpeechSynthesizer,
} from "microsoft-cognitiveservices-speech-sdk";
import { useState, useEffect, useRef } from "react";
import { useTranslations } from "next-intl";

import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";

import { getDeckNames } from "@/lib/agent";
import { Textarea } from "@/components/ui/textarea"; // <-- Make sure you have this in your project

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

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Initialize the Microsoft Speech SDK
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

  // Submit user query
  async function handleQuerySubmit() {
    if (loading) return;
    setLoading(true);
    const res = await fetch("/api/ask", {
      method: "POST",
      body: JSON.stringify({ query }),
    });
    const data = await res.json();
    const responseContent = data.response.choices[0].message.content;

    // Match language from response to set TTS language
    const languageMatch = responseContent.match(/Detected Language: (\S+)/);
    if (languageMatch && speechConfig) {
      speechConfig.speechSynthesisLanguage = languageMatch[1];
    }

    setResponse(data.response);
    setLoading(false);
  }

  // Pressing Enter => submit (unless Shift is held)
  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault(); // Avoid newline
      handleQuerySubmit();
    }
  }

  // Auto-resize logic
  function handleChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setQuery(e.target.value);

    if (textareaRef.current) {
      const el = textareaRef.current;
      el.style.height = "auto"; // reset the height
      el.style.height = `${el.scrollHeight}px`;
    }
  }

  // Process text to remove extraneous parentheses for TTS
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

  // Speak text via TTS
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

  // Parse response into distinct sections
  function parseResponseContent(content: string) {
    const sections = content.split("\n\n");
    const sentence = sections[0];
    const breakdown = sections.slice(2);
    return { sentence, breakdown };
  }

  // Render text with 🔊 buttons on certain tokens
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

  // Handle sync with Anki
  async function handleSyncAnki() {
    try {
      const decks = await getDeckNames();
      setDeckNames(decks);
    } catch (error) {
      console.error("Error syncing with Anki:", error);
    }
  }

  return (
    <div className="min-h-screen px-10 pt-4 flex flex-col gap-4">
      <div className="flex w-full items-center justify-between">
        <h1 className="text-2xl font-bold">Chie</h1>
        <Button onClick={() => setIsSettingsDialogOpen(true)}>
          <Settings />
        </Button>
      </div>

      <Card className="w-full">
        <CardContent>
          <div className="relative my-3">
            <Textarea
              ref={textareaRef}
              value={query}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              rows={1}
              placeholder={t("ask-a-question-placeholder")}
              disabled={loading}
              className="
                w-full 
                pr-10 
                resize-none 
                overflow-y-auto 
                max-h-[10rem] 
                scrollbar-thin 
                scrollbar-thumb-rounded 
                scrollbar-thumb-gray-300 
                hover:scrollbar-thumb-gray-400
              "
            />
            {query && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-4 top-1/2 -translate-y-1/2"
                onClick={() => setQuery("")}
              >
                <X size={16} />
              </Button>
            )}
          </div>

          <div className="flex items-center justify-between mb-3">
            <Button
              onClick={() => setShowImageArea(!showImageArea)}
              disabled={loading}
            >
              <Upload />
            </Button>

            <Button onClick={handleQuerySubmit} disabled={loading}>
              {loading ? <Loader className="animate-spin" /> : <Send />}
            </Button>
          </div>

          {showImageArea && <ImageArea setKeyword={setQuery} />}
        </CardContent>
      </Card>

      {/* Display the AI response */}
      {response && (
        <pre className="whitespace-pre-wrap mt-4">
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

      {/* Settings dialog */}
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
