import { NextResponse } from "next/server";

const tokenUrl = `https://westus2.api.cognitive.microsoft.com/sts/v1.0/issuetoken`;

export async function POST() {
  const response = await fetch(tokenUrl, {
    method: "POST",
    headers: {
      "Ocp-Apim-Subscription-Key": process.env.SPEECH_KEY!,
      "Content-Type": "application/x-www-form-urlencoded",
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    return NextResponse.json({ error: errorText }, { status: response.status });
  }

  return NextResponse.json({
    token: await response.text(),
    region: "westus2",
  });
}
