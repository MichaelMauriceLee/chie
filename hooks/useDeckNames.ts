import { useQuery, UseQueryResult } from 'react-query';
import { getDeckNames } from '../services/agent';

const isMobile = typeof window !== 'undefined' ? !!navigator.userAgent.match(/iphone|android|blackberry/ig) : false;
const pollingInterval = 1000;

const fetchDeckNames = async (setIsConnectedToAnki: (params: boolean) => void) => {
  try {
    const data = await getDeckNames();
    setIsConnectedToAnki(true);
    return data;
  } catch (error) {
    setIsConnectedToAnki(false);
    throw new Error(error.message ?? 'Failed getting deck names');
  }
};

const useDeckNames = (
  setIsConnectedToAnki: (params: boolean) => void,
): UseQueryResult<string[], Error> => useQuery('deckNames',
  () => fetchDeckNames(setIsConnectedToAnki),
  { refetchInterval: pollingInterval, enabled: !isMobile });

export default useDeckNames;
