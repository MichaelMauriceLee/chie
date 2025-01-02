"use client";

import React, { useState } from "react";
import { DictionaryResponse, Word } from "@/models/serverActions";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@radix-ui/react-accordion";
import { Card, CardHeader, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import {
  AudioConfig,
  PushAudioOutputStream,
  PushAudioOutputStreamCallback,
  SpeechConfig,
  SpeechSynthesizer,
} from "microsoft-cognitiveservices-speech-sdk";
import { useAtom } from "jotai";
import { selectedDeckAtom } from "@/store/atoms";
import { postNote } from "@/lib/agent";
import { format } from "date-fns";
import { Loader2, Plus, Volume2 } from "lucide-react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { v4 as uuidv4 } from "uuid";

type Props = {
  data: DictionaryResponse;
  region: string;
  token: string;
};

export default function DictionaryDisplay({
  data,
  region,
  token,
}: Readonly<Props>) {
  const t = useTranslations("DictionaryDisplay");

  const [selectedDeck] = useAtom(selectedDeckAtom);

  const [activeAdd, setActiveAdd] = useState<string | null>(null);

  function speakText(text: string, detectedLanguage: string) {
    try {
      const speechConfig = SpeechConfig.fromAuthorizationToken(token, region);
      speechConfig.speechSynthesisLanguage = detectedLanguage;
      const audioConfig = AudioConfig.fromDefaultSpeakerOutput();
      const synthesizer = new SpeechSynthesizer(speechConfig, audioConfig);

      synthesizer.speakTextAsync(
        text,
        () => {
          synthesizer.close();
        },
        (error) => {
          synthesizer.close();
          console.error(error);
          toast.error(t("speechFailed"), {
            position: "top-center",
          });
        }
      );
    } catch (error) {
      console.error(error);
      toast.error(t("speechFailed"), {
        position: "top-center",
      });
    }
  }

  async function saveAudioFile(
    text: string,
    detectedLanguage: string
  ): Promise<string | null> {
    return new Promise((resolve, reject) => {
      try {
        const speechConfig = SpeechConfig.fromAuthorizationToken(token, region);
        speechConfig.speechSynthesisLanguage = detectedLanguage;

        class CustomAudioCallback implements PushAudioOutputStreamCallback {
          private audioChunks: Uint8Array[] = [];

          write(dataBuffer: ArrayBuffer) {
            this.audioChunks.push(new Uint8Array(dataBuffer));
          }

          close() {
            try {
              const audioData = new Uint8Array(
                this.audioChunks.reduce(
                  (total, chunk) => total + chunk.length,
                  0
                )
              );
              let offset = 0;
              this.audioChunks.forEach((chunk) => {
                audioData.set(chunk, offset);
                offset += chunk.length;
              });

              const base64String = btoa(String.fromCharCode(...audioData));

              const dataUri = `data:audio/mpeg;base64,${base64String}`;

              resolve(dataUri);
            } catch (error) {
              console.error("Error processing audio chunks:", error);
              reject(null);
            }
          }
        }

        const audioCallback = new CustomAudioCallback();
        const pushStream = PushAudioOutputStream.create(audioCallback);
        const audioConfig = AudioConfig.fromStreamOutput(pushStream);

        const synthesizer = new SpeechSynthesizer(speechConfig, audioConfig);

        synthesizer.speakTextAsync(
          text,
          () => {
            synthesizer.close();
          },
          (error) => {
            synthesizer.close();
            console.error("Audio generation failed:", error);
            reject(null);
          }
        );
      } catch (error) {
        console.error(error);
        reject(null);
      }
    });
  }

  async function addToAnki(
    word: string,
    pronunciation: string,
    meanings: string[],
    sentence: string
  ) {
    if (!selectedDeck) {
      toast.error(t("errors.noDeckSelected"), {
        position: "top-center",
      });
      return;
    }

    let audioPath;
    try {
      audioPath = await saveAudioFile(word, data.detectedLanguage ?? "en-US");
    } catch {
      toast.error(t("errors.audioGenerationFailed"), {
        position: "top-center",
      });
      return;
    }

    if (!audioPath) {
      return;
    }

    const note = {
      deckName: selectedDeck,
      modelName: "Basic",
      fields: {
        Front: word,
        Back: `
          <div>
            <div style="margin-bottom: 1em;">
              <audio controls style="margin-top: 0.5em;">
                <source src="${audioPath}" type="audio/mpeg" />
                ${t("labels.audioNotSupported")}
              </audio>
            </div>
            <div style="margin-bottom: 1em;">
              <strong>${t("labels.pronunciation")}:</strong><br />
              ${pronunciation || t("labels.notAvailable")}
            </div>
            <div style="margin-bottom: 1em;">
              <strong>${t("labels.meanings")}:</strong><br />
              ${meanings.join(", ")}
            </div>
            <div style="margin-bottom: 1em;">
              <strong>${t("labels.originalSentence")}:</strong><br />
              ${sentence || t("labels.notAvailable")}
            </div>
            <div>
              <strong>${t("labels.addedOn")}:</strong><br />
              ${format(new Date(), t("dateFormat"))}
            </div>
          </div>
        `,
      },
      options: {
        allowDuplicate: false,
      },
      tags: ["dictionary"],
    };

    try {
      setActiveAdd(word);
      await postNote(note);
      toast.success(t("success.added", { word, deck: selectedDeck }), {
        position: "top-center",
      });
    } catch (error) {
      console.error(t("errors.addFailed"), error);
      toast.error(t("errors.addFailed"), {
        position: "top-center",
      });
    } finally {
      setActiveAdd(null);
    }
  }

  function renderWord(word: Word, level: number = 0) {
    return (
      <AccordionItem key={`word.text-${uuidv4()}`} value={`word-${word.text}`}>
        <AccordionTrigger asChild>
          <div
            className={`flex justify-between items-center p-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg ml-${
              level * 4
            }`}
          >
            <div>
              <div className="text-md font-medium text-gray-800 dark:text-gray-100">
                {word.text}
                {word.pronunciation && (
                  <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
                    ({word.pronunciation})
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  speakText(word.text, data.detectedLanguage ?? "en-US");
                }}
              >
                <Volume2 />
              </Button>
              <Button
                variant="ghost"
                onClick={(e) => {
                  e.stopPropagation();
                  addToAnki(
                    word.text,
                    word.pronunciation,
                    word.meanings,
                    data.sentence || ""
                  );
                }}
                disabled={!selectedDeck || !!activeAdd}
              >
                {activeAdd === word.text ? (
                  <Loader2 className="animate-spin w-4 h-4" />
                ) : (
                  <Plus />
                )}
              </Button>
            </div>
          </div>
        </AccordionTrigger>
        <AccordionContent className="mt-2 bg-white dark:bg-gray-800 p-4 border border-gray-100 dark:border-gray-700 rounded">
          <h3 className="text-sm font-medium mb-2 text-gray-800 dark:text-gray-100">
            {t("labels.meanings")}
          </h3>
          <ul className="list-disc ml-5 space-y-1 text-gray-700 dark:text-gray-300">
            {word.meanings.map((meaning, idx) => (
              <li key={idx}>{meaning}</li>
            ))}
          </ul>
          {word.words && word.words.length > 0 && (
            <Accordion type="single" collapsible className="mt-4 space-y-2">
              {word.words.map((nestedWord) =>
                renderWord(nestedWord, level + 1)
              )}
            </Accordion>
          )}
        </AccordionContent>
      </AccordionItem>
    );
  }

  return (
    <Card className="mt-4 shadow-lg border dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800">
      {data.sentence && (
        <CardHeader className="flex flex-row items-center space-x-3">
          <div className="text-lg font-semibold text-gray-800 dark:text-gray-100">
            {data.sentence}
          </div>
          <Button
            onClick={() =>
              speakText(data.sentence ?? "", data.detectedLanguage ?? "en-US")
            }
          >
            <Volume2 />
          </Button>
        </CardHeader>
      )}

      {data.explanation && (
        <CardContent className="text-gray-700 dark:text-gray-300">
          {data.explanation}
        </CardContent>
      )}

      <CardContent>
        {data.words && data.words.length > 0 && (
          <Accordion type="single" collapsible className="space-y-4">
            {data.words.map((word) => renderWord(word))}
          </Accordion>
        )}
      </CardContent>
    </Card>
  );
}
