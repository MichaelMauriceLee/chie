import { useContext } from 'react';
import { AnkiConnectionContext } from '../../components/Provider/AnkiConnectionProvider';

interface UseAnkiConnection {
  isConnectedToAnki?: boolean
  setIsConnectedToAnki?: (param: boolean) => void
}

const useAnkiConnection = (): UseAnkiConnection => {
  const { isConnectedToAnki, setIsConnectedToAnki } = useContext(AnkiConnectionContext);
  return { isConnectedToAnki, setIsConnectedToAnki };
};

export default useAnkiConnection;
