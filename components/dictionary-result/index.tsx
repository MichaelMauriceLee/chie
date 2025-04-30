import DictionaryDisplay from "./dictionary-display";
import { DictionaryResponse } from "@/models/serverActions";

async function getSpeechToken() {
  const apiKey = process.env.SPEECH_KEY;
  if (!apiKey) throw new Error("Speech key is missing");

  const response = await fetch(
    "https://westus2.api.cognitive.microsoft.com/sts/v1.0/issuetoken",
    {
      method: "POST",
      headers: {
        "Ocp-Apim-Subscription-Key": apiKey,
        "Content-Type": "application/x-www-form-urlencoded",
      },
    }
  );

  if (!response.ok)
    throw new Error(`Failed to fetch speech token: ${response.statusText}`);
  const token = await response.text();
  return { token, region: "westus2" };
}

async function askDictionary(
  query: string,
  displayLanguage: string,
  targetLanguage: string,
  jpStyle?: "romaji" | "hiragana-katakana"
): Promise<DictionaryResponse> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) throw new Error("Missing OpenRouter API key");

  const langText =
    targetLanguage === "auto" ? "the appropriate language" : targetLanguage;

  let pronunciationNote = "";

  if (targetLanguage === "ja") {
    if (jpStyle === "romaji") {
      pronunciationNote = "Use romaji for pronunciation.";
    } else if (jpStyle === "hiragana-katakana") {
      pronunciationNote = "Use hiragana/katakana for pronunciation.";
    }
  }

  const systemPrompt = `
    You are a multilingual dictionary assistant.

    Input: ${query}

    1. Translate the input into ${langText}, if necessary.
    2. Break the input down into individual words or components:
      - Text: original word/component
      - Pronunciation: human-friendly pronunciation in ${langText}
      - Meanings: list of possible meanings
      - If compound, also break into sub-words with the same structure.
    3. Always provide a general explanation about grammar, usage, or context in ${displayLanguage}.

    ${pronunciationNote}

    Respond ONLY in minified JSON matching the following TypeScript models:

    \
    type Word = {
      text: string;
      pronunciation: string;
      meaning: string[];
      words: Word[];
    };

    type DictionaryResponse = {
      explanation: string;
      words?: Word[];
      sentence?: string;
      detectedLanguage?: string;
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
                      words: {
                        type: "array",
                        description: "Nested components (for compound words)",
                        items: {},
                      },
                    },
                    required: ["text", "pronunciation", "meaning", "words"],
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
              required: ["explanation", "sentence", "detectedLanguage"],
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
    return JSON.parse(rawContent);
  } catch {
    console.error("Failed to parse content as JSON:", rawContent);
    throw new Error("Invalid JSON returned from Gemini");
  }
}

type Props = {
  query: string;
  displayLanguage: string;
  targetLanguage: string;
  japanesePronunciationStyle?: "romaji" | "hiragana-katakana";
};

export default async function DictionaryResult({
  query,
  displayLanguage,
  targetLanguage,
  japanesePronunciationStyle,
}: Readonly<Props>) {
  const [data, speechToken] = await Promise.all([
    askDictionary(
      query,
      displayLanguage,
      targetLanguage,
      japanesePronunciationStyle
    ),
    getSpeechToken(),
  ]);

  if (!data) return null;

  return (
    <DictionaryDisplay
      data={data}
      token={speechToken.token}
      region={speechToken.region}
    />
  );
}
