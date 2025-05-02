"use client";

import React from "react";
import { DictionaryResponse } from "@/models/serverActions";
import { Card, CardHeader, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { Volume2 } from "lucide-react";
import { speakText } from "@/lib/audio";
import DictionaryWordItem from "./dictionary-word-item";
import { Accordion } from "@radix-ui/react-accordion";

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
  return (
    <Card className="mt-4 shadow-lg border dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800">
      {data.sentence && (
        <CardHeader className="flex flex-row items-center space-x-3">
          <div className="text-lg font-semibold text-gray-800 dark:text-gray-100">
            {data.sentence}
          </div>
          <Button
            onClick={() =>
              speakText(
                data.sentence ?? "",
                data.detectedLanguage ?? "en-US",
                token,
                region
              )
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
            {data.words.map((word, idx) => (
              <DictionaryWordItem
                key={`${word.text}-${idx}`}
                word={word}
                sentence={data.sentence ?? ""}
                detectedLanguage={data.detectedLanguage ?? "en-US"}
                token={token}
                region={region}
              />
            ))}
          </Accordion>
        )}
      </CardContent>
    </Card>
  );
}
