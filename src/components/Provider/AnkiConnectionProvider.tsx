import React, {
  createContext, useState,
} from 'react';

interface ContextProps {
  isConnectedToAnki: boolean;
  setIsConnectedToAnki: (param: boolean) => void
}

export const AnkiConnectionContext = createContext<Partial<ContextProps>>({});

const AnkiConnectionProvider: React.FC = ({ children }) => {
  const [isConnectedToAnki, setIsConnectedToAnki] = useState(false);
  return (
    <AnkiConnectionContext.Provider value={{ isConnectedToAnki, setIsConnectedToAnki }}>
      {children}
    </AnkiConnectionContext.Provider>
  );
};

export default AnkiConnectionProvider;
