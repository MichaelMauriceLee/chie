import React, { createContext, useState } from 'react';

export const AnkiConnectionContext = createContext({});

const AnkiConnectionProvider: React.FC = ({ children }) => {
  const [isConnectedToAnki, setIsConnectedToAnki] = useState(false);
  return (
    <AnkiConnectionContext.Provider value={{ isConnectedToAnki, setIsConnectedToAnki }}>
      {children}
    </AnkiConnectionContext.Provider>
  );
};

export default AnkiConnectionProvider;
