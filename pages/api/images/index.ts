import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';
import getRawBody from 'raw-body';

const analyzeImageUrl = `https://${process.env.CV_NAME}.cognitiveservices.azure.com/vision/v3.2-preview.3/read/analyze?language=ja`;

export const config = {
  api: {
    bodyParser: false,
  },
};

const images = async (req: NextApiRequest, res: NextApiResponse): Promise<void> => {
  const buffer = await getRawBody(req);
  const { headers } = await axios.post(analyzeImageUrl, buffer, {
    headers: {
      'Ocp-Apim-Subscription-Key': process.env.CV_KEY,
      'Content-Type': 'application/octet-stream',
    },
  });
  const readResultUrl = headers['operation-location'];
  res.status(200).json(readResultUrl);
};

export default images;
