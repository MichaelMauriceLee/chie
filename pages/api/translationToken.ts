import type { NextApiRequest, NextApiResponse } from 'next'
import axios from 'axios';

const tokenUrl = `https://${process.env.TRANSLATION_REGION}.api.cognitive.microsoft.com/sts/v1.0/issuetoken`;

const translationToken = async (_: NextApiRequest, res: NextApiResponse) => {
  const { data } = await axios.post(tokenUrl, null, {
    headers: {
        'Ocp-Apim-Subscription-Key': process.env.TRANSLATION_KEY,
        'Content-Type': 'application/x-www-form-urlencoded',
    },
  });
  res.status(200).json({ token: data, region: process.env.TRANSLATION_REGION });
}

export default translationToken;
