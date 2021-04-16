import type { NextApiRequest, NextApiResponse } from 'next'
import axios from 'axios';

const analyzeImageUrl = `https://${process.env.CV_NAME}.cognitiveservices.azure.com/vision/v3.2-preview.3/read/analyze?language=ja`;

const images = async (req: NextApiRequest, res: NextApiResponse) => {
  const { headers } = await axios.post(analyzeImageUrl, req.body, {
    headers: {
        'Ocp-Apim-Subscription-Key': process.env.CV_KEY,
        'Content-Type': 'application/octet-stream',
    },
  });
  const readResultUrl = headers['operation-location'];
  res.status(200).json(readResultUrl.split('/').pop());
}

export default images;
