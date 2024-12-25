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

async function askDictionary(query: string) {
  const apiKey = process.env.OPENAI_KEY;

  if (!apiKey) {
    throw new Error("Open AI key is missing");
  }

  try {
    const response = await fetch(
      "https://chieopenai.openai.azure.com/openai/deployments/gpt-4o-mini/chat/completions?api-version=2024-02-15-preview",
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
  
                  1. If the input is a general question about grammar or language, provide a detailed explanation in the "explanation" field.
                  2. If the input is a sentence or word, do the following:
                    - Translate it into English.
                    - Break down the sentence or word into individual components.
                    - For each component, provide:
                      - **Text**: The word itself.
                      - **Pronunciation**: How the word is pronounced.
                      - **Meanings**: A list of possible meanings.
                      - **Compound Words**: If the word is part of a compound word, provide the breakdown of its components with their meanings and pronunciations.
  
                  Format the output as JSON matching the following TypeScript models:
  
                  \`\`\`typescript
                  export type Word = {
                    text: string; // The original word or component
                    pronunciation: string; // How the word is pronounced
                    meanings: string[]; // Possible meanings
                    words: Word[]; // Nested components for compound words
                  };
  
                  export type DictionaryResponse = {
                    explanation?: string; // A general explanation for questions and translations
                    words?: Word[]; // The breakdown of words and their details
                    pronunciation?: string; // How the sentence is pronounced (only relevant if translating)
                    detectedLanguage?: string; // locale string used to feed into Azure TTS (i.e. ja-JP)
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

    return JSON.parse(content) as DictionaryResponse;
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : "Unknown error");
  }
}

export default async function DictionaryResult({ query }: { query: string }) {
  const dictionaryDataPromise = askDictionary(query);

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
