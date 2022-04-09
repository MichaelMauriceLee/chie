import { useEffect } from 'react';
import { useQuery } from 'react-query';
import { SettingsActionType } from '../../components/Provider/SettingsProvider';
import { getCurrentDeckNotes, getDeckNames } from '../../services/agent';
import isMobile from '../../utils/client/isMobile';
import useSettings from '../useSettings';
import useAnkiConnection from './useAnkiConnection';

interface UseAnki {
  isConnectedToAnki: boolean
  currentDeckNotes: Record<string, boolean>
  deckList: string[]
}

const useAnkiInfo = (): UseAnki => {
  const pollingInterval = 1000;
  const { isConnectedToAnki = false, setIsConnectedToAnki } = useAnkiConnection();

  const { state, dispatch } = useSettings();

  const fetchCurrentDeckNotes = async () => {
    try {
      const regex = /(<([^>]+)>)/ig; // strip any html text that may appear and get inner text
      const dict: Record<string, boolean> = {};
      if (state && state.currentDeckName) {
        const data = await getCurrentDeckNotes(state.currentDeckName);
        data.forEach((note) => {
          console.log(note)
          const { value } = note.fields.Front;
          const w = value.replace(regex, '');
          dict[w] = true;
        });
        if (setIsConnectedToAnki) {
          setIsConnectedToAnki(true);
        }
      }
      return dict;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      if (setIsConnectedToAnki) {
        setIsConnectedToAnki(false);
      }
      throw new Error(error.message ?? 'Failed getting current deck notes');
    }
  };

  const fetchDeckNames = async () => {
    try {
      const data = await getDeckNames();
      if (setIsConnectedToAnki) {
        setIsConnectedToAnki(true);
      }
      return data;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      if (setIsConnectedToAnki) {
        setIsConnectedToAnki(false);
      }
      throw new Error(error.message ?? 'Failed getting deck names');
    }
  };

  const { data: currentDeckNotes = {} } = useQuery(['currentDeckNotes', state?.currentDeckName],
    () => fetchCurrentDeckNotes(),
    {
      refetchInterval: pollingInterval,
      enabled: !isMobile,
    });

  const { data: deckList = [] } = useQuery('deckNames',
    () => fetchDeckNames(),
    {
      refetchInterval: pollingInterval,
      enabled: !isMobile,
    });

  // if there isnt any currentDeckName, assign one
  // (will either be there or will be undefined since couldn't get one)
  useEffect(() => {
    if (state && !state.currentDeckName && deckList && deckList.length !== 0) {
      if (dispatch) {
        dispatch({
          type: SettingsActionType.changeCurrentDeckName,
          payload: deckList[0],
        });
      }
    }
  }, [isConnectedToAnki]);

  return {
    isConnectedToAnki,
    currentDeckNotes,
    deckList,
  };
};

export default useAnkiInfo;
