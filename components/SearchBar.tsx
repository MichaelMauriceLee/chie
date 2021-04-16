import React, { useCallback, useRef, useEffect } from 'react';
import debounce from 'lodash.debounce';
import useNotification from '../hooks/useNotification';
import { NotificationType } from '../models/Notification';
import useTextToSpeech from '../hooks/useTextToSpeech';

interface SearchBarProps {
  keyword?: string;
  setKeyword: (param: string) => void;
  setShowImageArea: (callback: (prev: boolean) => boolean) => void;
  setShowVoiceArea: (callback: (prev: boolean) => boolean) => void;
  fetchSearchResults: () => void
  setShowInfo: (param: boolean) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({
  keyword, setKeyword, setShowImageArea, setShowVoiceArea, fetchSearchResults, setShowInfo,
}) => {
  const searchBarRef = useRef<HTMLTextAreaElement>(null);

  const dispatch = useNotification();
  const createErrorNotification = (error: Error) => {
    dispatch({
      type: NotificationType.Error,
      message: error.message,
    });
  };

  const onKeyDown = (evt: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (evt.key === 'Enter') {
      evt.preventDefault();
      searchBarRef.current?.blur();
    }
  };

  const debouncedSubmit = useCallback(
    debounce((searchTerm) => {
      if (searchTerm) {
        fetchSearchResults();
      }
    }, 500),
    [],
  );

  const onInputChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setKeyword(event.target.value);
    setShowInfo(false);
  };

  const resizeTextArea = () => {
    if (searchBarRef.current && searchBarRef.current.style) {
      searchBarRef.current.style.height = '';
      searchBarRef.current.style.height = `${searchBarRef.current.scrollHeight}px`;
    }
  };

  const clearSearchBar = () => {
    if (searchBarRef.current) {
      searchBarRef.current.style.height = '';
    }
    setKeyword('');
  };

  useEffect(() => {
    debouncedSubmit(keyword);
  }, [keyword]);

  return (
    <div className="flex flex-row justify-between items-center mt-4">
      <div className="flex flex-row items-center outline border-2 focus-within:border-blue-500 flex-grow">
        <div className="relative flex-grow">
          <textarea
            className="block text-lg p-4 w-full appearance-none focus:outline-none bg-transparent"
            id="searchInput"
            placeholder=" "
            ref={searchBarRef}
            value={keyword}
            onChange={onInputChange}
            onKeyDown={onKeyDown}
            style={{ resize: 'none' }}
            rows={1}
            onInput={resizeTextArea}
          />

          <label
            className="absolute p-4 text-lg top-0 duration-300 -z-1 origin-0 bg-white"
            htmlFor="searchInput"
          >
            Search
          </label>
        </div>

        {keyword && (
          <div className="flex flex-row items-center">
            <button
              className="rounded-full hover:text-blue-500 focus:outline-none focus:ring focus:border-blue-500 ml-1"
              type="button"
              onClick={() => { useTextToSpeech(keyword, createErrorNotification); }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="md:h-10 md:w-10 h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z" clipRule="evenodd" />
              </svg>
            </button>

            <button
              className="rounded-full hover:text-blue-500 focus:outline-none focus:ring focus:border-blue-500 mx-1"
              type="button"
              onClick={clearSearchBar}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="md:h-10 md:w-10 h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        )}
      </div>

      <button
        className="md:h-16 md:w-16 h-8 w-8 rounded-full hover:text-blue-500 ml-2 focus:outline-none focus:ring focus:border-blue-500"
        type="button"
        aria-label="Activate Speech to Text"
        onClick={() => {
          setShowVoiceArea((prev: boolean) => !prev);
          setShowImageArea(() => false);
          setShowInfo(false);
        }}
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
        </svg>
      </button>

      <button
        className="md:h-16 md:w-16 h-8 w-8 rounded-full hover:text-blue-500 ml-2 focus:outline-none focus:ring focus:border-blue-500"
        type="button"
        aria-label="Find Text in Photo"
        onClick={() => {
          setShowImageArea((prev: boolean) => !prev);
          setShowVoiceArea(() => false);
          setShowInfo(false);
        }}
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
        </svg>
      </button>
    </div>
  );
};

export default SearchBar;
