export async function getSpeechToken(): Promise<{
  token: string;
  region: string;
}> {
  const apiKey = process.env.SPEECH_KEY;

  if (!apiKey) {
    throw new Error("Speech key is missing");
  }

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
}
