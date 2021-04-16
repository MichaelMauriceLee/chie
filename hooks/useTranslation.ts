import { AxiosError } from 'axios';
import { useQuery, UseQueryResult } from 'react-query';
import { TranslateLineRequest, TranslateLineResponse } from '../models/Translation';
import { getTranslation, getTranslationToken } from '../services/agent';

const fetchTranslation = async (sentence: string) => {
  try {
    const { token } = await getTranslationToken();
    const payload: TranslateLineRequest[] = [
      {
        Text: sentence,
      },
    ];
    // TODO return empty if it doesnt recognize the language
    const [jpToEnTranslation, enToJpTranslation] = await Promise.all([getTranslation(payload, token, 'en', 'ja'), getTranslation(payload, token, 'ja', 'en')]);
    if (jpToEnTranslation.map((x) => x.translations.map((y) => y.text)).join('') !== sentence) return jpToEnTranslation;
    return enToJpTranslation;
  } catch (err) {
    if (err.response) {
      throw err;
    } else {
      throw new Error('Failed to get translation');
    }
  }
};

const useTranslation = (
  sentence: string,
  errorCallback?: (error: AxiosError) => void,
): UseQueryResult<TranslateLineResponse[], AxiosError> => useQuery(['translation', sentence],
  () => fetchTranslation(sentence),
  {
    enabled: false,
    onError: (error: AxiosError) => { if (errorCallback) { errorCallback(error); } },
    retry: (_, error: AxiosError) => {
      if (error.response && error.response.status === 400) {
        return false;
      }
      return true;
    },
  });

export default useTranslation;
