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

  return (
    <Card className="mt-4 shadow-lg border border-gray-200 rounded-lg">
      {data.sentence && (
        <CardHeader className="flex flex-row items-center space-x-3">
          <div className="text-lg font-semibold text-gray-800">
            {data.sentence}
          </div>
          <Button
            className="bg-blue-500 text-white rounded hover:bg-blue-600"
            onClick={(e) => {
              e.stopPropagation();
              speakText(data.sentence ?? "", data.detectedLanguage ?? "en-US");
            }}
          >
            🔊
          </Button>
        </CardHeader>
      )}

      {data.explanation && <CardContent> {data.explanation}</CardContent>}

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
                  {word.pronunciation && (
                    <Button
                      variant="ghost"
                      className="ml-4 px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                      onClick={(e) => {
                        e.stopPropagation();
                        speakText(
                          word.text ?? "",
                          data.detectedLanguage ?? "en-US"
                        );
                      }}
                    >
                      🔊
                    </Button>
                  )}
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
                              {subWord.pronunciation && (
                                <Button
                                  variant="ghost"
                                  className="ml-4 px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    speakText(
                                      subWord.text ?? "",
                                      data.detectedLanguage ?? "en-US"
                                    );
                                  }}
                                >
                                  🔊
                                </Button>
                              )}
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
