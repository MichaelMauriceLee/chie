import DictionaryDisplay from "./dictionary-display";
import { DictionaryResponse } from "@/models/serverActions";
import { cache } from "react";

const dictionaryCache = new Map<string, DictionaryResponse>();

const askDictionary = cache(async (
  query: string,
  displayLanguage: string,
  targetLanguage: string,
  jpStyle?: "romaji" | "hiragana-katakana"
): Promise<DictionaryResponse> => {
  const cacheKey = `${query}-${displayLanguage}-${targetLanguage}-${jpStyle || ''}`;

  const cachedResult = dictionaryCache.get(cacheKey);
  if (cachedResult) {
    return cachedResult;
  }

  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) throw new Error("Missing OpenRouter API key");

  let pronunciationNote = "";
  if (targetLanguage === "ja") {
    if (jpStyle === "romaji") {
      pronunciationNote = "Use romaji for pronunciation.";
    } else if (jpStyle === "hiragana-katakana") {
      pronunciationNote = "Use hiragana/katakana for pronunciation.";
    }
  } else if (targetLanguage === "zh-MN") {
    pronunciationNote = "Use pinyin for pronunciation.";
  } else if (targetLanguage === "zh-CT") {
    pronunciationNote = "Use jyutping for pronunciation.";
  }

  const systemPrompt = `
    You are a multilingual dictionary assistant.

    Input: ${query}

    1. Translate the input into ${targetLanguage === "auto" ? "the appropriate language" : targetLanguage
    }, if necessary.
    2. Break the input down into individual words or components:
      - Text: original word/component
      - Pronunciation: human-friendly pronunciation in ${targetLanguage}
      - Meanings: list of possible meanings
      - For compound words or words formed from smaller units, populate the "words" array with components.
      - Each component must follow the same { text, pronunciation, meaning, words } structure.
      - Always include an empty "words" array, even for atomic words.
      - You may nest sub-words up to 2 levels deep.
    3. Always provide a general explanation about grammar, usage, or context in ${displayLanguage}.

    ${pronunciationNote}

    Respond ONLY in minified JSON matching the following TypeScript models:

    \
    type Word = {
      text: string;           // The original word or component
      pronunciation: string;  // Human-friendly pronunciation
      meaning: string[];      // Dictionary definition meanings
    };

    type DictionaryResponse = {
      explanation: string;        // A general explanation or direct translation
      words: Word[];             // The breakdown of words and their details
      sentence: string;          // The original sentence (cleaned of filler words or questions)
      detectedLanguage: string;  // Locale string (e.g. ja-JP) for Azure TTS
    };
    \
  `;

  const response = await fetch(
    "https://openrouter.ai/api/v1/chat/completions",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-preview",
        messages: [{ role: "user", content: systemPrompt.trim() }],
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "dictionaryResponse",
            strict: true,
            schema: {
              type: "object",
              properties: {
                explanation: {
                  type: "string",
                  description: "A general explanation or direct translation",
                },
                words: {
                  type: "array",
                  description: "The breakdown of words and their details",
                  items: {
                    type: "object",
                    properties: {
                      text: {
                        type: "string",
                        description: "The original word or component",
                      },
                      pronunciation: {
                        type: "string",
                        description: "Human-friendly pronunciation",
                      },
                      meaning: {
                        type: "array",
                        description: "Dictionary definition meanings",
                        items: { type: "string" },
                      },
                    },
                    required: ["text", "pronunciation", "meaning"],
                  },
                },
                sentence: {
                  type: "string",
                  description:
                    "The original sentence (cleaned of filler words or questions)",
                },
                detectedLanguage: {
                  type: "string",
                  description: "Locale string for Azure TTS (e.g., 'ja-JP')",
                },
              },
              required: ["explanation", "sentence", "detectedLanguage", "words"],
              additionalProperties: false,
            },
          },
        },
      }),
    }
  );

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`OpenRouter error: ${err}`);
  }

  const json = await response.json();
  const rawContent = json.choices?.[0]?.message?.content;

  if (!rawContent) throw new Error("No content returned from OpenRouter");

  try {
    const stripped = rawContent
      .replace(/^```(?:json)?\s*/i, "")
      .replace(/\s*```$/, "")
      .trim();
    const result = JSON.parse(stripped);

    // Store the result in our cache
    dictionaryCache.set(cacheKey, result);

    return result;
  } catch {
    console.error("Failed to parse content as JSON:", rawContent);
    throw new Error("Invalid JSON returned from Gemini");
  }
});

type Props = {
  query: string;
  displayLanguage: string;
  targetLanguage: string;
  japanesePronunciationStyle?: "romaji" | "hiragana-katakana";
  speechToken: string;
  speechRegion: string;
};

export default async function DictionaryResult({
  query,
  displayLanguage,
  targetLanguage,
  japanesePronunciationStyle,
  speechToken,
  speechRegion,
}: Readonly<Props>) {
  const data = await askDictionary(
    query,
    displayLanguage,
    targetLanguage,
    japanesePronunciationStyle
  );

  if (!data) return null;

  return (
    <DictionaryDisplay data={data} token={speechToken} region={speechRegion} />
  );
}
