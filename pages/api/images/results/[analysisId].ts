import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

const analysisResultsUrl = `https://${process.env.CV_NAME}.cognitiveservices.azure.com/vision/v3.2-preview.3/read/analyzeResults`;

const analysisResult = async (req: NextApiRequest, res: NextApiResponse): Promise<void> => {
  const { analysisId } = req.query;
  if (!analysisId) {
    throw new Error('Must include analysis id.');
  }
  const { data } = await axios.get(`${analysisResultsUrl}/${analysisId}`, {
    headers: {
      'Ocp-Apim-Subscription-Key': process.env.CV_KEY,
    },
  });
  res.status(200).json(data);
};

export default analysisResult;
