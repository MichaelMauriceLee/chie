import { Dispatch, useContext } from 'react';
import { Settings, SettingsAction, SettingsContext } from '../components/SettingsProvider';

interface UseSettings {
  state: Settings;
  dispatch: Dispatch<SettingsAction>;
}

const useSettings = (): UseSettings => {
  const { state, dispatch } = useContext(SettingsContext);
  return { state, dispatch };
};

export default useSettings;
