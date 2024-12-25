"use client";

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

  function speakText(text: string, detectedLanguage: string) {
    const speechConfig = SpeechConfig.fromAuthorizationToken(token, region);
    speechConfig.speechSynthesisLanguage = detectedLanguage;
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
  }

  return (
    <Card className="mt-4">
      {data.explanation && (
        <CardHeader>
          <p>
            {data.explanation}
            {data.pronunciation && (
              <Button
                onClick={() =>
                  speakText(
                    data.pronunciation ?? "",
                    data.detectedLanguage ?? "en-US"
                  )
                }
              >
                🔊
              </Button>
            )}
          </p>
        </CardHeader>
      )}
      <CardContent>
        {data.words && data.words.length > 0 && (
          <Accordion type="single" collapsible>
            {data.words.map((word, index) => (
              <AccordionItem key={index} value={`word-${index}`}>
                <AccordionTrigger>
                  <span className="font-semibold">{word.text}</span>
                  {word.pronunciation && (
                    <span className="text-sm text-gray-500 ml-2">
                      ({word.pronunciation})
                    </span>
                  )}
                  <Button
                    onClick={() =>
                      speakText(
                        word.pronunciation ?? "",
                        data.detectedLanguage ?? "en-US"
                      )
                    }
                  >
                    🔊
                  </Button>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="mt-2">
                    <h3 className="text-sm font-medium">Meanings:</h3>
                    <ul className="list-disc ml-5">
                      {word.meanings.map((meaning, idx) => (
                        <li key={idx}>{meaning}</li>
                      ))}
                    </ul>
                  </div>
                  {word.words && word.words.length > 0 && (
                    <div className="mt-4">
                      <h3 className="text-sm font-medium">Compound Words:</h3>
                      <Accordion type="single" collapsible>
                        {word.words.map((subWord, subIdx) => (
                          <AccordionItem
                            key={subIdx}
                            value={`subword-${subIdx}`}
                          >
                            <AccordionTrigger>
                              {subWord.text}{" "}
                              {subWord.pronunciation && (
                                <span className="text-sm text-gray-500 ml-2">
                                  ({subWord.pronunciation})
                                </span>
                              )}
                            </AccordionTrigger>
                            <AccordionContent>
                              <ul className="list-disc ml-5">
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
