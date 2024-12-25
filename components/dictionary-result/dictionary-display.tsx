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

  async function addToAnki(
    word: string,
    pronunciation: string,
    meanings: string[],
    sentence: string
  ) {
    if (!selectedDeck) {
      toast.error("Please select a deck first in the settings.");
      return;
    }

    const front = word;
    const back = `
      <strong>Pronunciation:</strong> ${pronunciation || "N/A"}<br />
      <strong>Meanings:</strong> ${meanings.join(", ")}<br />
      <strong>Original Sentence:</strong> ${sentence || "N/A"}<br />
      <strong>Added on:</strong> ${format(new Date(), "MMMM dd, yyyy, hh:mm a")}
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
    };

    try {
      setActiveAdd(word);
      await postNote(note);
      toast.success(`Added "${word}" to deck "${selectedDeck}"`);
    } catch (error) {
      console.error("Failed to add card to Anki:", error);
      toast.error("Failed to add card to Anki.");
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
                <AccordionTrigger className="flex justify-between items-center p-3 bg-gray-100 hover:bg-gray-200 rounded-lg">
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
                </AccordionTrigger>
                <AccordionContent className="mt-2 bg-white p-4 border border-gray-100 rounded">
                  <h3 className="text-sm font-medium mb-2">Meanings:</h3>
                  <ul className="list-disc ml-5 space-y-1 text-gray-700">
                    {word.meanings.map((meaning, idx) => (
                      <li key={idx}>{meaning}</li>
                    ))}
                  </ul>

                  {word.words && word.words.length > 0 && (
                    <div className="mt-4">
                      <h4 className="text-sm font-medium mb-2">
                        Compound Words:
                      </h4>
                      <Accordion type="single" collapsible>
                        {word.words.map((subWord, subIdx) => (
                          <AccordionItem
                            key={subIdx}
                            value={`subword-${subIdx}`}
                          >
                            <AccordionTrigger className="flex justify-between items-center p-3 bg-gray-50 hover:bg-gray-100 rounded-lg">
                              <span className="text-sm text-gray-800">
                                {subWord.text}
                                {subWord.pronunciation && (
                                  <span className="ml-2 text-xs text-gray-500">
                                    ({subWord.pronunciation})
                                  </span>
                                )}
                              </span>
                              <div className="flex items-center space-x-2 ml-2">
                                {subWord.pronunciation && (
                                  <Button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      speakText(
                                        subWord.text ?? "",
                                        data.detectedLanguage ?? "en-US"
                                      );
                                    }}
                                  >
                                    <Volume2 />
                                  </Button>
                                )}
                                <Button
                                  variant="ghost"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    addToAnki(
                                      subWord.text,
                                      subWord.pronunciation,
                                      subWord.meanings,
                                      data.sentence || ""
                                    );
                                  }}
                                  disabled={!selectedDeck || !!activeAdd}
                                >
                                  {activeAdd === subWord.text ? (
                                    <Loader2 className="animate-spin w-4 h-4" />
                                  ) : (
                                    <Plus />
                                  )}
                                </Button>
                              </div>
                            </AccordionTrigger>
                            <AccordionContent className="mt-2 bg-white p-3 border border-gray-50 rounded">
                              <ul className="list-disc ml-5 space-y-1 text-sm text-gray-700">
                                {subWord.meanings.map((subMeaning, subId) => (
                                  <li key={subId}>{subMeaning}</li>
                                ))}
                              </ul>
                            </AccordionContent>
                          </AccordionItem>
                        ))}
                      </Accordion>
                    </div>
                  )}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        )}
      </CardContent>
    </Card>
  );
}
