import { useQuery, UseQueryResult } from 'react-query';
import { getCurrentDeckNotes } from '../services/agent';

const isMobile = typeof window !== 'undefined' ? !!navigator.userAgent.match(/iphone|android|blackberry/ig) : false;
const pollingInterval = 1000;

const fetchCurrentDeckNotes = async (
  setIsConnectedToAnki: (params: boolean) => void, currentDeckName: string,
) => {
  try {
    const data = await getCurrentDeckNotes(currentDeckName);
    const regex = /(<([^>]+)>)/ig; // strip any html text that may appear and get inner text
    const dict: Record<string, boolean> = {};
    data.forEach((note) => {
      const { value } = note.fields.Front;
      const w = value.replace(regex, '');
      dict[w] = true;
    });
    setIsConnectedToAnki(true);
    return dict;
  } catch (error) {
    setIsConnectedToAnki(false);
    throw new Error(error.message ?? 'Failed getting current deck notes');
  }
};

const useCurrentDeckNotes = (
  setIsConnectedToAnki: (params: boolean) => void, currentDeckName: string,
): UseQueryResult<Record<string, boolean>, Error> => useQuery(['currentDeckNotes', currentDeckName],
  () => fetchCurrentDeckNotes(setIsConnectedToAnki, currentDeckName),
  { refetchInterval: pollingInterval, enabled: !isMobile });

export default useCurrentDeckNotes;
