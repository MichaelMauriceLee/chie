import { ActionFunction, json } from "@remix-run/node";
import axios from "axios";

const analyzeImageUrl = `https://${process.env.CV_NAME}.cognitiveservices.azure.com/vision/v3.2/read/analyze?language=ja`;

export const action: ActionFunction = async ({ request }) => {
  switch (request.method) {
    case "POST": {
      const data = await request.json()
      const buffer = Buffer.from(data.image.split(",")[1], "base64");
      const { headers } = await axios.post(analyzeImageUrl, buffer, {
        headers: {
          "Ocp-Apim-Subscription-Key": process.env.CV_KEY!,
          "Content-Type": "application/octet-stream",
        },
      });
      const readResultUrl = headers["operation-location"];
      return json(readResultUrl.split("/").pop());
    }
  }
};
