"use server";

import { OCRResponse } from "@/models/serverActions";
import { cache } from "react";

export const getSpeechToken = cache(async () => {
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
});

export const analyzeImage = cache(async (imageBase64: string) => {
  const apiKey = process.env.CV_KEY;

  if (!apiKey) {
    throw new Error("CV key is missing");
  }

  if (!imageBase64) {
    throw new Error("Image data is required");
  }

  try {
    const buffer = Buffer.from(imageBase64.split(",")[1], "base64");

    const response = await fetch(
      "https://chiecv.cognitiveservices.azure.com/computervision/imageanalysis:analyze?features=read&model-version=latest&language=en&api-version=2024-02-01",
      {
        method: "POST",
        headers: {
          "Ocp-Apim-Subscription-Key": apiKey,
          "Content-Type": "application/octet-stream",
        },
        body: buffer,
      }
    );

    if (!response.ok) {
      const errorDetails = await response.text();
      throw new Error(`Azure API Error: ${errorDetails}`);
    }

    const data = await response.json();
    return data as OCRResponse;
  } catch (error) {
    throw new Error(
      error instanceof Error ? error.message : "Unknown error occurred"
    );
  }
});
