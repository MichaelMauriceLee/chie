import { json, LoaderFunction } from "@remix-run/node";
import axios from "axios";

const tokenUrl = `https://${process.env.TRANSLATION_REGION}.api.cognitive.microsoft.com/sts/v1.0/issuetoken`;

export const loader: LoaderFunction = async ({ request }) => {
  const { data } = await axios.post(tokenUrl, null, {
    headers: {
      "Ocp-Apim-Subscription-Key": process.env.SPEECH_KEY,
      "Content-Type": "application/x-www-form-urlencoded",
    },
  });
  return json({ token: data, region: process.env.TRANSLATION_REGION });
};
