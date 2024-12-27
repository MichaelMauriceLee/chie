"use client";

import React, { useState } from "react";
import { DictionaryResponse } from "@/models/serverActions";
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
import { FieldTypes } from "@/models/note";

type DictionaryDisplayProps = {
  data: DictionaryResponse;
  region: string;
  token: string;
};

export default function DictionaryDisplay({
  data,
  region,
  token,
}: DictionaryDisplayProps) {
  const t = useTranslations("DictionaryDisplay");

  const [selectedDeck] = useAtom(selectedDeckAtom);

  const [activeAdd, setActiveAdd] = useState<string | null>(null);

  function speakText(text: string, detectedLanguage: string) {
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
        console.error(error);
        synthesizer.close();
      }
    );
  }

  async function saveAudioFile(
    text: string,
    detectedLanguage: string,
    filename: string
  ): Promise<string | null> {
    return new Promise((resolve, reject) => {
      const speechConfig = SpeechConfig.fromAuthorizationToken(token, region);
      speechConfig.speechSynthesisLanguage = detectedLanguage;
      const audioConfig = AudioConfig.fromAudioFileOutput(filename);
      const synthesizer = new SpeechSynthesizer(speechConfig, audioConfig);

      synthesizer.speakTextAsync(
        text,
        () => {
          synthesizer.close();
          resolve(filename);
        },
        (error) => {
          synthesizer.close();
          console.error("Audio generation failed:", error);
          reject(null);
        }
      );
    });
  }

  async function addToAnki(
    word: string,
    pronunciation: string,
    meanings: string[],
    sentence: string
  ) {
    if (!selectedDeck) {
      toast.error(t("errors.noDeckSelected"));
      return;
    }

    const filename = `${word}.mp3`;

    const audioPath = await saveAudioFile(
      sentence,
      data.detectedLanguage ?? "en-US",
      filename
    );

    if (!audioPath) {
      toast.error(t("errors.audioGenerationFailed"));
      return;
    }

    const front = word;
    const back = `
      <strong>${t("labels.pronunciation")}:</strong> ${
      pronunciation || t("labels.notAvailable")
    }<br />
      <strong>${t("labels.meanings")}:</strong> ${meanings.join(", ")}<br />
      <strong>${t("labels.originalSentence")}:</strong> ${
      sentence || t("labels.notAvailable")
    }<br />
      <strong>${t("labels.addedOn")}:</strong> ${format(
      new Date(),
      t("dateFormat")
    )}
    `;

    const note = {
      deckName: selectedDeck,
      modelName: "Basic",
      fields: {
        Front: front,
        Back: back,
      },
      options: {
        allowDuplicate: false,
      },
      tags: ["dictionary"],
      audio: [
        {
          url: `file://${audioPath}`,
          filename: filename,
          fields: [FieldTypes.Back],
        },
      ],
    };

    try {
      setActiveAdd(word);
      await postNote(note);
      toast.success(t("success.added", { word, deck: selectedDeck }));
    } catch (error) {
      console.error(t("errors.addFailed"), error);
      toast.error(t("errors.addFailed"));
    } finally {
      setActiveAdd(null);
    }
  }

  return (
    <Card className="mt-4 shadow-lg border border-gray-200 rounded-lg">
      {data.sentence && (
        <CardHeader className="flex flex-row items-center space-x-3">
          <div className="text-lg font-semibold text-gray-800">
            {data.sentence}
          </div>
          <Button
            onClick={(e) => {
              e.stopPropagation();
              speakText(data.sentence ?? "", data.detectedLanguage ?? "en-US");
            }}
          >
            <Volume2 />
          </Button>
        </CardHeader>
      )}

      {data.explanation && <CardContent>{data.explanation}</CardContent>}

      <CardContent>
        {data.words && data.words.length > 0 && (
          <Accordion type="single" collapsible className="space-y-4">
            {data.words.map((word, index) => (
              <AccordionItem key={index} value={`word-${index}`}>
                <AccordionTrigger
                  asChild
                  className="flex justify-between items-center p-3 bg-gray-100 hover:bg-gray-200 rounded-lg"
                >
                  <div>
                    <div className="text-md font-medium text-gray-800">
                      {word.text}
                      {word.pronunciation && (
                        <span className="ml-2 text-sm text-gray-500">
                          ({word.pronunciation})
                        </span>
                      )}
                    </div>
                    <div className="flex items-center space-x-2 ml-2">
                      {word.pronunciation && (
                        <div>
                          <Button
                            onClick={(e) => {
                              e.stopPropagation();
                              speakText(
                                word.text ?? "",
                                data.detectedLanguage ?? "en-US"
                              );
                            }}
                          >
                            <Volume2 />
                          </Button>
                        </div>
                      )}
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
                <AccordionContent className="mt-2 bg-white p-4 border border-gray-100 rounded">
                  <h3 className="text-sm font-medium mb-2">
                    {t("labels.meanings")}
                  </h3>
                  <ul className="list-disc ml-5 space-y-1 text-gray-700">
                    {word.meanings.map((meaning, idx) => (
                      <li key={idx}>{meaning}</li>
                    ))}
                  </ul>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        )}
      </CardContent>
    </Card>
  );
}
