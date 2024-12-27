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

type DictionaryDisplayProps = {
  data: DictionaryResponse;
  region: string;
  token: string;
  i18n: {
    errors: {
      speechFailed: string;
      audioGenerationFailed: string;
      addFailed: string;
      noDeckSelected: string;
    };
    labels: {
      audioNotSupported: string;
      pronunciation: string;
      notAvailable: string;
      meanings: string;
      originalSentence: string;
      addedOn: string;
    };
    success: {
      added: (params: { word: string; deck: string }) => string;
    };
    dateFormat: string;
  };
};

export default function DictionaryDisplay({
  data,
  region,
  token,
  i18n,
}: DictionaryDisplayProps) {
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
          toast.error(i18n.errors.speechFailed, {
            position: "top-center",
          });
        }
      );
    } catch (error) {
      console.error(error);
      toast.error(i18n.errors.speechFailed, {
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
      toast.error(i18n.errors.noDeckSelected, {
        position: "top-center",
      });
      return;
    }

    let audioPath;
    try {
      audioPath = await saveAudioFile(word, data.detectedLanguage ?? "en-US");
    } catch {
      toast.error(i18n.errors.audioGenerationFailed, {
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
                ${i18n.labels.audioNotSupported}
              </audio>
            </div>
            <div style="margin-bottom: 1em;">
              <strong>${i18n.labels.pronunciation}:</strong><br />
              ${pronunciation || i18n.labels.notAvailable}
            </div>
            <div style="margin-bottom: 1em;">
              <strong>${i18n.labels.meanings}:</strong><br />
              ${meanings.join(", ")}
            </div>
            <div style="margin-bottom: 1em;">
              <strong>${i18n.labels.originalSentence}:</strong><br />
              ${sentence || i18n.labels.notAvailable}
            </div>
            <div>
              <strong>${i18n.labels.addedOn}:</strong><br />
              ${format(new Date(), i18n.dateFormat)}
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
      toast.success(i18n.success.added({ word, deck: selectedDeck }), {
        position: "top-center",
      });
    } catch (error) {
      console.error(i18n.errors.addFailed, error);
      toast.error(i18n.errors.addFailed, {
        position: "top-center",
      });
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
                    {i18n.labels.meanings}
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
