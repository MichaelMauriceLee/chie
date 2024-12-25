import { NextRequest, NextResponse } from "next/server";

const analyzeImageUrl =
  "https://chiecv.cognitiveservices.azure.com/computervision/imageanalysis:analyze?features=read&model-version=latest&language=en&api-version=2024-02-01";

export async function POST(req: NextRequest) {
  try {
    const { image } = await req.json();

    if (!image) {
      return NextResponse.json(
        { error: "Image data is required" },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(image.split(",")[1], "base64");

    const response = await fetch(analyzeImageUrl, {
      method: "POST",
      headers: {
        "Ocp-Apim-Subscription-Key": process.env.CV_KEY || "",
        "Content-Type": "application/octet-stream",
      },
      body: buffer,
    });

    if (!response.ok) {
      const errorDetails = await response.text();
      throw new Error(`Azure API Error: ${errorDetails}`);
    }

    const data = await response.json();

    return NextResponse.json({ ...data });
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";

    console.error("Error analyzing image:", errorMessage);

    return NextResponse.json(
      {
        error: "Failed to analyze image",
        details: errorMessage,
      },
      { status: 500 }
    );
  }
}
