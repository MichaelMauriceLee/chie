import { useEffect, useState } from 'react';
import { useQuery } from 'react-query';
import { SettingsActionType } from '../../components/Provider/SettingsProvider';
import { getCurrentDeckNotes, getDeckNames } from '../../services/agent';
import isMobile from '../../utils/isMobile';
import useSettings from '../useSettings';
import useAnkiConnection from './useAnkiConnection';

interface UseAnki {
  isConnectedToAnki: boolean
  currentDeckNotes: Record<string, boolean>
  deckList: string[]
}

const useAnkiInfo = (): UseAnki => {
  const pollingInterval = 1000;
  const { isConnectedToAnki, setIsConnectedToAnki } = useAnkiConnection();

  const { state: { currentDeckName }, dispatch } = useSettings();

  const fetchCurrentDeckNotes = async () => {
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

  const fetchDeckNames = async () => {
    try {
      const data = await getDeckNames();
      setIsConnectedToAnki(true);
      return data;
    } catch (error) {
      setIsConnectedToAnki(false);
      throw new Error(error.message ?? 'Failed getting deck names');
    }
  };

  const { data: currentDeckNotes = {} } = useQuery(['currentDeckNotes', currentDeckName],
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
    if (!currentDeckName && deckList && deckList.length !== 0) {
      dispatch({
        type: SettingsActionType.changeCurrentDeckName,
        payload: deckList[0],
      });
    }
  }, [isConnectedToAnki]);

  return {
    isConnectedToAnki,
    currentDeckNotes,
    deckList,
  };
};

export default useAnkiInfo;
