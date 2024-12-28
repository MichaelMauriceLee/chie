import { ChatGPTResponse, DictionaryResponse } from "@/models/serverActions";
import DictionaryDisplay from "./dictionary-display";

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

async function askDictionary(query: string, language: string) {
  const apiKey = process.env.OPENAI_KEY;

  if (!apiKey) {
    throw new Error("Open AI key is missing");
  }

  try {
    const response = await fetch(
      "https://chieopenai.openai.azure.com/openai/deployments/gpt-4o-mini/chat/completions?api-version=2024-08-01-preview",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "api-key": apiKey,
        },
        body: JSON.stringify({
          messages: [
            {
              role: "system",
              content: `
                You are a multilingual dictionary that provides detailed explanations for words and sentences.

                When given a sentence or phrase, follow these steps:

                1. If the input is a general question about grammar or language, provide a detailed explanation in the "explanation" field in ${language}.

                2. If the input is a sentence or word, do the following:
                  - Translate it into ${language} if it is not already in ${language}.
                  - Break down the sentence or word into individual components using the following structure:
                    - **Text**: The word itself.
                    - **Pronunciation**: A human-friendly pronunciation guide in ${language}.
                    - **Meanings**: A list of possible meanings in ${language}.
                    - **Compound Words**: If the word is a compound word, provide the breakdown of its components with their text, pronunciations, and meanings.


                3. For sentences:
                  - Translate the sentence into ${language} if needed.
                  - Provide the original sentence or phrase (minus unrelated filler words or questions) in the "sentence" field to preserve the user's input.
                  
                4. Always populate the "explanation" field:
                  - Include grammar, usage, or contextual insights in ${language} even if no direct question was asked. This ensures the output consistently provides valuable linguistic information.

                Format the output as JSON matching the following TypeScript models:

                \`\`\`typescript
                type Word = {
                  text: string;           // The original word or component
                  pronunciation: string;  // Human-friendly pronunciation
                  meanings: string[];     // Possible meanings
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
          max_tokens: 4000,
          temperature: 0.7,
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();

      throw new Error(errorData.error || "Unknown error occurred.");
    }

    const data = (await response.json()) as ChatGPTResponse;

    let content = data.choices[0].message.content;

    if (content.startsWith("```json") && content.endsWith("```")) {
      content = content.slice(7, -3).trim();
    }

    console.log(content);

    return JSON.parse(content) as DictionaryResponse;
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : "Unknown error");
  }
}

type DictionaryResultProps = {
  query: string;
  language: string;
};

export default async function DictionaryResult({
  query,
  language,
}: DictionaryResultProps) {
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
