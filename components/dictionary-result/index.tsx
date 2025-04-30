import DictionaryDisplay from "./dictionary-display";
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
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) throw new Error("Missing OpenRouter API key");

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
        messages: [
          {
            role: "user",
            content: ` 
              You are a multilingual dictionary assistant.

              Input: ${query}

              1. Translate the input into ${language}, if necessary.
              2. Break the input down into individual words or components:
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
              \`\`\``,
          },
        ],
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
                      text: { type: "string", description: "The individual word(s)" },
                      pronunciation: { type: "string", description: "Human-friendly pronunciation" },
                      meaning: {
                        type: "array",
                        description: "Dictionary definiton meanings of the word",
                        items: { type: "string" },
                      },
                      words: {
                        type: "array",
                        items: {
                          type: "object",
                          properties: {
                            text: { type: "string", description: "The individual word(s)" },
                            pronunciation: { type: "string", description: "Human-friendly pronunciation" },
                            meaning: {
                              type: "array",
                              description: "Dictionary definiton meanings of the word",
                              items: { type: "string" },
                            },
                            words: { type: "array", items: {} },
                          },
                          required: [
                            "text",
                            "pronunciation",
                            "meaning",
                            "words",
                          ],
                        },
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
                  description: "BCP-47 language tag for TTS, e.g., 'ja-JP'.",
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
    const parsed = JSON.parse(rawContent);
    return parsed as DictionaryResponse;
  } catch {
    console.error("Failed to parse content as JSON:", rawContent);
    throw new Error("Invalid JSON returned from Gemini");
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
