import axios from 'axios';
import { TranslateLineRequest, TranslateLineResponse } from '../../models/Translation';

const translationUrl = 'https://api.cognitive.microsofttranslator.com/translate?api-version=3.0';

// eslint-disable-next-line import/prefer-default-export
export const fetchTranslation = async (keyword: string): Promise<TranslateLineResponse> => {
  const payload: TranslateLineRequest[] = [
    {
      Text: keyword,
    },
  ];

  const url = `${translationUrl}&to=en`;

  const { data } = await axios.post(url, payload, {
    headers: {
      'Ocp-Apim-Subscription-Key': process.env.TRANSLATION_KEY,
      'Ocp-Apim-Subscription-Region': process.env.TRANSLATION_REGION,
    },
  });

  return data[0];
};
