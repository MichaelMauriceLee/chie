import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { query } = await req.json();

  const endpoint =
    "https://chieopenai.openai.azure.com/openai/deployments/gpt-4o-mini/chat/completions?api-version=2024-02-15-preview";
  const apiKey = process.env.OPENAI_KEY;

  if (!apiKey) {
    return NextResponse.json({ error: "API key is missing" }, { status: 500 });
  }

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": apiKey,
      },
      body: JSON.stringify({
        messages: [
          {
            role: "system",
            content: [
              {
                type: "text",
                text: "I am building a multilingual dictionary that includes translations, phonetics, and word-by-word breakdowns for sentences. When given a sentence that is not in english, first translate the sentence into english.  Next, go through word by word and description what each of the words means in english.  Ensure that in your response, the original sentence and any parts of the sentence is surrounded by ### so they can be recognized and spoken aloud by a text to speech program.  Please write the detected language Azure Speech recognizes (i.e. 'ja-JP') at the end of the response in this format 'Detected Language: ja-JP'.",
              },
            ],
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: query,
              },
            ],
          },
        ],
        max_tokens: 4000,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(
        { error: errorData },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json({ response: data });
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    } else {
      return NextResponse.json({ error: "Unknown error" }, { status: 500 });
    }
  }
}
