import { json, LoaderFunction } from '@remix-run/node';
import axios from 'axios';

const analysisResultsUrl = `https://${process.env.CV_NAME}.cognitiveservices.azure.com/vision/v3.2/read/analyzeResults`;

export const loader: LoaderFunction = async ({ params })=> {
  const { data } = await axios.get(`${analysisResultsUrl}/${params.id}`, {
    headers: {
      'Ocp-Apim-Subscription-Key': process.env.CV_KEY!,
    },
  });
  return json(data)
};
