import React, { Dispatch, SetStateAction } from 'react';

interface AnkiDeckSelectProps {
  currentDeckName: string | null;
  setCurrentDeckName: Dispatch<SetStateAction<string>>;
  deckList: string[];
}

const AnkiDeckSelect: React.FC<AnkiDeckSelectProps> = ({
  deckList, currentDeckName, setCurrentDeckName,
}) => (
  <div className="mt-3 text-center">
    <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-headline" data-cy="current-deck-title">
      Current Deck
    </h3>
    <div className="flex flex-col mt-2 space-y-1">
      {deckList.map((deck) => (
        <button
          className={`border border-gray-500 p-1 rounded focus:outline-none focus:ring focus:border-blue-500
          shadow ${deck === currentDeckName ? 'border-blue-500 text-blue-500 cursor-default' : 'hover:border-blue-500 hover:bg-blue-500 hover:text-white'}`}
          key={deck}
          type="button"
          data-cy="deck-name-button"
          disabled={currentDeckName === deck}
          onClick={() => { setCurrentDeckName(deck); }}
        >
          {deck}
        </button>
      ))}
    </div>
  </div>
);

export default AnkiDeckSelect;
