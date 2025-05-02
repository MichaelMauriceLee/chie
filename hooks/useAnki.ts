"use client";

import { useState } from "react";
import { Word } from "@/models/serverActions";
import { toast } from "sonner";
import { useAtom } from "jotai";
import { selectedDeckAtom } from "@/store/atoms";
import { postNote } from "@/lib/agent";
import { saveAudioFile } from "@/lib/audio";
import { format } from "date-fns";
import { useTranslations } from "next-intl";

export function useAnki(
  token: string,
  region: string,
  detectedLanguage: string,
  sentence: string
) {
  const [selectedDeck] = useAtom(selectedDeckAtom);
  const [activeWord, setActiveWord] = useState<string | null>(null);
  const t = useTranslations("DictionaryDisplay");

  async function addToAnki(word: Word) {
    if (!selectedDeck) {
      toast.error(t("errors.noDeckSelected"), { position: "top-center" });
      return;
    }

    setActiveWord(word.text);

    let audio;
    try {
      audio = await saveAudioFile(word.text, detectedLanguage, token, region);
    } catch {
      toast.error(t("errors.audioGenerationFailed"), {
        position: "top-center",
      });
      setActiveWord(null);
      return;
    }

    const note = {
      deckName: selectedDeck,
      modelName: "Basic",
      fields: {
        Front: word.text,
        Back: `
          <div>
            <div style="margin-bottom: 1em;">
              <audio controls style="margin-top: 0.5em;">
                <source src="${audio}" type="audio/mpeg" />
                ${t("labels.audioNotSupported")}
              </audio>
            </div>
            <div style="margin-bottom: 1em;">
              <strong>${t("labels.pronunciation")}:</strong><br />
              ${word.pronunciation || t("labels.notAvailable")}
            </div>
            <div style="margin-bottom: 1em;">
              <strong>${t("labels.meanings")}:</strong><br />
              ${word.meaning.join(", ")}
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
      options: { allowDuplicate: false },
      tags: ["dictionary"],
    };

    try {
      await postNote(note);
      toast.success(
        t("success.added", { word: word.text, deck: selectedDeck }),
        {
          position: "top-center",
        }
      );
    } catch (e) {
      toast.error(t("errors.addFailed"), { position: "top-center" });
      console.error(e);
    } finally {
      setActiveWord(null);
    }
  }

  return { addToAnki, activeWord };
}
