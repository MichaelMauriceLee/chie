import { Card, CardHeader, CardContent } from "@/components/ui/card";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { ChatGPTResponse, DictionaryResponse } from "@/models/serverActions";

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
                    - Translate it into English if it is not already in English.
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
                    explanation?: string; // A general explanation for questions
                    words?: Word[]; // The breakdown of words and their details
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
  const data = await askDictionary(query);

  if (!data) {
    return null; 
  }

  return (
    <Card className="mt-4">
      {data.explanation && (
        <CardHeader>
          <p>{data.explanation}</p>
        </CardHeader>
      )}
      <CardContent>
        {data.words && data.words.length > 0 && (
          <Accordion type="single" collapsible>
            {data.words.map((word, index) => (
              <AccordionItem key={index} value={`word-${index}`}>
                <AccordionTrigger>
                  <span className="font-semibold">{word.text}</span>
                  {word.pronunciation && (
                    <span className="text-sm text-gray-500 ml-2">
                      ({word.pronunciation})
                    </span>
                  )}
                </AccordionTrigger>
                <AccordionContent>
                  <div className="mt-2">
                    <h3 className="text-sm font-medium">Meanings:</h3>
                    <ul className="list-disc ml-5">
                      {word.meanings.map((meaning, idx) => (
                        <li key={idx}>{meaning}</li>
                      ))}
                    </ul>
                  </div>
                  {word.words && word.words.length > 0 && (
                    <div className="mt-4">
                      <h3 className="text-sm font-medium">Compound Words:</h3>
                      <Accordion type="single" collapsible>
                        {word.words.map((subWord, subIdx) => (
                          <AccordionItem
                            key={subIdx}
                            value={`subword-${subIdx}`}
                          >
                            <AccordionTrigger>
                              {subWord.text}{" "}
                              {subWord.pronunciation && (
                                <span className="text-sm text-gray-500 ml-2">
                                  ({subWord.pronunciation})
                                </span>
                              )}
                            </AccordionTrigger>
                            <AccordionContent>
                              <ul className="list-disc ml-5">
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
