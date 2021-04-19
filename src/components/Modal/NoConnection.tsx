import React from 'react';
import isMobile from '../../utils/isMobile';

const NoConnection: React.FC = () => (
  <div className="mt-3 text-center">
    <h3 className="text-lg leading-6 font-medium text-gray-900">
      No connection
    </h3>
    <div className="mt-2">
      {isMobile ? (
        <div className="text-lg">
          Cannot detect Anki settings since you are on a mobile device.
          If you have AnkiDroid or AnkiMobile (TBI) installed, you can still add cards.
        </div>
      ) : (
        <div className="text-lg">
          You must connect Anki in order to access settings.  Find out more
          {' '}
          <a
            className="underline hover:text-blue-500"
            href="https://github.com/MichaelMauriceLee/chie"
          >
            here.
          </a>
        </div>
      )}
    </div>
  </div>
);

export default NoConnection;
