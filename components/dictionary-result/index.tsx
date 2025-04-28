import DictionaryDisplay from "./dictionary-display";
import { openrouter } from "@/lib/openrouter";
import { generateText } from "ai";
import { DictionaryResponse } from "@/models/serverActions";

async function getSpeechToken() {
  const apiKey = process.env.SPEECH_KEY;

  if (!apiKey) {
    throw new Error("Speech key is missing");
  }

  try {
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

    if (!response.ok) {
      throw new Error(`Failed to fetch speech token: ${response.statusText}`);
    }

    const token = await response.text();

    return { token, region: "westus2" };
  } catch (error) {
    throw new Error(
      error instanceof Error ? error.message : "Unknown error occurred"
    );
  }
}

async function askDictionary(
  query: string,
  language: string
): Promise<DictionaryResponse> {
  const { text } = await generateText({
    model: openrouter.chat("deepseek/deepseek-chat-v3-0324:free"),
    messages: [
      {
        role: "system",
        content: `
          You are a multilingual dictionary assistant.

          When given a word, phrase, or sentence:

          1. Translate it into ${language}, if necessary.
          2. Break it down into individual words or components:
            - Text: original word/component
            - Pronunciation: human-friendly pronunciation in ${language}
            - Meanings: list of possible meanings
            - If compound, also break into sub-words with the same structure.
          3. Always provide a general explanation about grammar, usage, or context in ${language}.

          Respond ONLY in minified JSON matching the following TypeScript models:

          \`\`\`typescript
          type Word = {
            text: string;           // The original word or component
            pronunciation: string;  // Human-friendly pronunciation
            meaning: string[];      // Possible meanings
            words: Word[];          // Nested components for compound words
          };

          type DictionaryResponse = {
            explanation: string;        // A general explanation or direct translation
            words?: Word[];             // The breakdown of words and their details
            sentence?: string;          // The original sentence (cleaned of filler words or questions)
            detectedLanguage?: string;  // Locale string (e.g. ja-JP) for Azure TTS
          };
          \`\`\`
        `,
      },
      {
        role: "user",
        content: query,
      },
    ],
    temperature: 0.7,
  });

  if (!text) {
    throw new Error("No content returned");
  }

  const cleaned = text.trim();

  const match = cleaned.match(/\{[\s\S]*\}/);
  if (!match) {
    console.error("Failed to find JSON in AI response:", cleaned);
    throw new Error("No valid JSON found in AI response.");
  }

  const jsonString = match[0];

  try {
    return JSON.parse(jsonString) as DictionaryResponse;
  } catch {
    console.error("Failed to parse extracted JSON:", jsonString);
    throw new Error("Invalid JSON returned by AI.");
  }
}

type Props = {
  query: string;
  language: string;
};

export default async function DictionaryResult({
  query,
  language,
}: Readonly<Props>) {
  const dictionaryDataPromise = askDictionary(query, language);
  const tokenPromise = getSpeechToken();

  const [data, speechToken] = await Promise.all([
    dictionaryDataPromise,
    tokenPromise,
  ]);

  if (!data) {
    return null;
  }

  return (
    <DictionaryDisplay
      data={data}
      token={speechToken.token}
      region={speechToken.region}
    />
  );
}
