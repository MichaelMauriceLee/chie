import React from 'react';
import { useQueryClient } from 'react-query';
import useAnkiInfo from '../../hooks/anki/useAnkiInfo';
import useCreateNote from '../../hooks/anki/useNoteMutation';
import useNotification from '../../hooks/useNotification';
import useSettings from '../../hooks/useSettings';
import useTextToSpeech from '../../hooks/useTextToSpeech';
import { Note } from '../../models/Note';
import { JapaneseWord, SearchResult } from '../../models/SearchResult';
import isMobile from '../../utils/isMobile';

interface SearchResultItemProps {
  searchResult: SearchResult;
}

enum ButtonType {
  Kanji = 'kanji',
  Kana = 'kana',
}

const SearchResultItem: React.FC<SearchResultItemProps> = ({ searchResult }) => {
  const {
    isConnectedToAnki,
    currentDeckNotes,
  } = useAnkiInfo();

  const { state } = useSettings();

  const { createSuccessNotification, createErrorNotification } = useNotification();
  const createAddedNoteNotification = () => {
    createSuccessNotification(state && `Successfully added card to deck: ${state.currentDeckName}`);
  };

  const queryClient = useQueryClient();
  const { mutate } = useCreateNote(
    queryClient,
    createAddedNoteNotification,
    createErrorNotification,
  );

  const isWordAlreadyInAnki = (dictWord: JapaneseWord, type?: ButtonType) => {
    switch (type) {
      case (ButtonType.Kanji): {
        if (!dictWord.word) {
          return true;
        }
        if (currentDeckNotes && currentDeckNotes[dictWord.word]) {
          return true;
        }
        return false;
      }
      case (ButtonType.Kana): {
        if (currentDeckNotes && currentDeckNotes[dictWord.reading]) {
          return true;
        }
        return false;
      }
      default: {
        if (currentDeckNotes && dictWord.word && currentDeckNotes[dictWord.word]) {
          return true;
        }
        if (currentDeckNotes && currentDeckNotes[dictWord.reading]) {
          return true;
        }
        return false;
      }
    }
  };

  const showAddCardBtn = () => {
    if (isMobile) {
      return true;
    }
    return isConnectedToAnki;
  };

  const disableButton = (sR: JapaneseWord, type: ButtonType) => {
    if (isMobile) {
      return false;
    }
    return !isConnectedToAnki || isWordAlreadyInAnki(sR, type);
  };

  const isSomeWordAlreadyInAnki = () => searchResult.japanese.some(
    (dictWord) => isWordAlreadyInAnki(dictWord),
  );

  const createCardAndAddToDeck = async (i: number, kanaOnly: boolean) => {
    let backContent = kanaOnly ? '' : `${searchResult.japanese[i].reading}<br>`;
    searchResult.senses.forEach((sense, index) => {
      backContent += `${sense.parts_of_speech.join('; ')}<br>`;
      backContent += `${index + 1}. ${sense.english_definitions.join('; ')}`;
      if (sense.tags.length !== 0) {
        backContent += '<br>';
        backContent += sense.tags.join('; ');
      }

      if (index !== searchResult.senses.length - 1) {
        backContent += '<br>';
      }
    });

    const newNote: Note = {
      deckName: state ? state.currentDeckName : '',
      modelName: 'Basic',
      fields: {
        Front: kanaOnly ? searchResult.japanese[i].reading : searchResult.japanese[i].word,
        Back: backContent,
      },
    };

    if (isMobile) { // used for adding notes on android
      if (navigator.share) {
        navigator.share(
          {
            title: kanaOnly ? searchResult.japanese[i].reading : searchResult.japanese[i].word,
            text: backContent,
          },
        );
      }
    } else {
      mutate(newNote);
    }
  };

  return (
    <div className={`grid md:grid-cols-5 grid-cols-1 gap-4 rounded-md border ${isSomeWordAlreadyInAnki() ? 'bg-gray-100' : ''}`}>
      <div className="col-span-2 md:pl-7 md:pr-0 md:pt-2 md:pb-2 px-2 pt-2">
        <div className="flex flex-row justify-between items-center">
          <div className="flex flex-row items-center space-x-2">
            <div className="text-5xl font-bold">
              {searchResult.japanese[0].word
                ? searchResult.japanese[0].word
                : searchResult.japanese[0].reading}
            </div>
            <button
              className="rounded-full focus:outline-none focus:ring focus:border-blue-500 hover:text-blue-500"
              type="button"
              onClick={() => {
                useTextToSpeech(searchResult.japanese[0].reading,
                  createErrorNotification);
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z" clipRule="evenodd" />
              </svg>
            </button>
          </div>

          {showAddCardBtn() ? (
            <div className="flex flex-row space-x-3">
              <button
                className={`group rounded focus:outline-none focus:ring focus:border-blue-500 ${disableButton(searchResult.japanese[0], ButtonType.Kanji) ? 'opacity-50 cursor-default' : 'hover:text-blue-500 cursor-pointer'}`}
                type="button"
                disabled={disableButton(searchResult.japanese[0], ButtonType.Kanji)}
                onClick={() => { createCardAndAddToDeck(0, false); }}
              >
                <div>
                  <div className={`rounded-full ${disableButton(searchResult.japanese[0], ButtonType.Kanji) ? '' : 'group-hover:bg-gray-200'}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    漢字
                  </div>
                </div>
              </button>

              <button
                className={`group rounded focus:outline-none focus:ring focus:border-blue-500 ${disableButton(searchResult.japanese[0], ButtonType.Kana) ? 'opacity-50 cursor-default' : 'hover:text-blue-500 cursor-pointer'}`}
                type="button"
                disabled={disableButton(searchResult.japanese[0], ButtonType.Kana)}
                onClick={() => { createCardAndAddToDeck(0, true); }}
              >
                <div>
                  <div className={`rounded-full ${disableButton(searchResult.japanese[0], ButtonType.Kana) ? '' : 'group-hover:bg-gray-200'}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    かな
                  </div>
                </div>
              </button>
            </div>
          ) : (
            <div className="h-10 w-10 rounded-full opacity-50">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
          )}
        </div>

        <div className={searchResult.japanese[0].word ? 'text-2 pt-2' : 'text-5xl font-bold'}>
          {searchResult.japanese[0].word && searchResult.japanese[0].reading}
        </div>

        {searchResult.is_common
          && (
            <div className="text-green-700 pt-1">
              common word
            </div>
          )}

        {searchResult.jlpt
          && (
            <div className="text-blue-700 pt-1">
              {searchResult.jlpt.join(', ').replace(/-/g, ' ')}
            </div>
          )}

        {searchResult.japanese.length !== 1 && (
          <div>
            <div className="text-gray-500 pt-2">
              Other forms
            </div>

            {searchResult.japanese.slice(1).map((sR, index) => (
              <div
                className="flex flex-row justify-between items-center"
                // eslint-disable-next-line react/no-array-index-key
                key={index}
              >
                <div className="flex flex-row space-x-2 items-center">
                  <div className="font-bold pr-1">
                    {sR.word}
                  </div>
                  {sR.word ? (
                    <div>
                      [
                      {sR.reading}
                      ]
                    </div>
                  ) : (
                    <div className="font-bold pr-1">
                      {sR.reading}
                    </div>
                  )}
                  <button
                    className="rounded-full focus:outline-none focus:ring focus:border-blue-500 hover:text-blue-500"
                    type="button"
                    onClick={() => { useTextToSpeech(sR.reading, createErrorNotification); }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
                {showAddCardBtn() && (
                <div className="flex flex-row space-x-3">
                  <button
                    className={`group rounded focus:outline-none focus:ring focus:border-blue-500 ${disableButton(searchResult.japanese[index + 1], ButtonType.Kanji) ? 'opacity-50 cursor-default' : 'hover:text-blue-500 cursor-pointer'}`}
                    type="button"
                    disabled={disableButton(searchResult.japanese[index + 1], ButtonType.Kanji)}
                    onClick={() => { createCardAndAddToDeck(index + 1, false); }}
                  >
                    <div>
                      <div className={`rounded-full ${disableButton(searchResult.japanese[index + 1], ButtonType.Kanji) ? '' : 'group-hover:bg-gray-200'}`}>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div>
                        漢字
                      </div>
                    </div>
                  </button>

                  <button
                    className={`group rounded focus:outline-none focus:ring focus:border-blue-500 ${disableButton(searchResult.japanese[index + 1], ButtonType.Kana) ? 'opacity-50 cursor-default' : 'hover:text-blue-500 cursor-pointer'}`}
                    type="button"
                    disabled={disableButton(searchResult.japanese[index + 1], ButtonType.Kana)}
                    onClick={() => { createCardAndAddToDeck(index + 1, true); }}
                  >
                    <div>
                      <div className={`rounded-full ${disableButton(searchResult.japanese[index + 1], ButtonType.Kana) ? '' : 'group-hover:bg-gray-200'}`}>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div>
                        かな
                      </div>
                    </div>
                  </button>
                </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="md:col-span-2 col-span-1 md:pl-0 py-2 pl-2 space-y-4">
        {searchResult.senses.map((sense, index) => (
          // eslint-disable-next-line react/no-array-index-key
          <div key={index}>
            <div className="text-base text-gray-500">
              {sense.parts_of_speech.join(', ')}
            </div>

            <div className="text-base">
              {index + 1}
              .
              {' '}
              {sense.english_definitions.join('; ')}
            </div>

            {sense.tags.length !== 0 && (
              <div className="text-base text-gray-500">
                {sense.tags.join('; ')}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default SearchResultItem;
