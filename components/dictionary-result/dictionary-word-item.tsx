"use client";

import React from "react";
import { Word } from "@/models/serverActions";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@radix-ui/react-accordion";
import { Button } from "../ui/button";
import { Plus, Volume2, Loader2 } from "lucide-react";
import { useAnki } from "@/hooks/useAnki";
import { speakText } from "@/lib/audio";
import { useTranslations } from "next-intl";
import { v4 as uuidv4 } from 'uuid';

type Props = {
  word: Word;
  sentence: string;
  detectedLanguage: string;
  token: string;
  region: string;
  level?: number;
};

export default function DictionaryWordItem({
  word,
  sentence,
  detectedLanguage,
  token,
  region,
  level = 0,
}: Readonly<Props>) {
  const t = useTranslations("DictionaryDisplay");
  const { addToAnki, activeWord } = useAnki(
    token,
    region,
    detectedLanguage,
    sentence
  );

  return (
    <AccordionItem value={`word-${word.text}`} className={`ml-${level * 4}`}>
      <AccordionTrigger asChild>
        <div className="flex justify-between items-center p-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg">
          <div className="text-md font-medium text-gray-800 dark:text-gray-100">
            {word.text}
            {word.pronunciation && (
              <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
                ({word.pronunciation})
              </span>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <Button
              onClick={(e) => {
                e.stopPropagation();
                speakText(word.text, detectedLanguage, token, region);
              }}
            >
              <Volume2 />
            </Button>
            <Button
              variant="ghost"
              onClick={(e) => {
                e.stopPropagation();
                addToAnki(word);
              }}
              disabled={activeWord === word.text}
            >
              {activeWord === word.text ? (
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
          {word.meaning.map((meaning) => (
            <li key={meaning}>{meaning}</li>
          ))}
        </ul>
        {word.words?.length > 0 && (
          <Accordion type="single" collapsible className="mt-4 space-y-2">
            {word.words.map((sub) => (
              <DictionaryWordItem
                key={uuidv4()}
                word={sub}
                sentence={sentence}
                detectedLanguage={detectedLanguage}
                token={token}
                region={region}
                level={level + 1}
              />
            ))}
          </Accordion>
        )}
      </AccordionContent>
    </AccordionItem>
  );
}
