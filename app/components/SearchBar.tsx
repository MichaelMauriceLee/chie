/* eslint-disable jsx-a11y/anchor-has-content */
import React, { useMemo, useRef, useState } from 'react';
import { Form, Link, useLocation, useSearchParams } from '@remix-run/react';
import useTextToSpeech from '~/hooks/useTextToSpeech';
import useNotification from '~/hooks/useNotification';

const SearchBar: React.FC = () => {
  const [params] = useSearchParams()
  const [query, setQuery] = useState<string>(params.get('query') ?? '')

  useMemo(() => {
    setQuery(params.get('query') ?? '')
  }, [params])

  const formRef = useRef<HTMLFormElement>(null);

  const location = useLocation()
  const imageModuleUrl = location.pathname + location.search + '#image-module'
  const voiceModuleUrl = location.pathname + location.search + '#voice-module'

  const { createErrorNotification } = useNotification();

  const onInput = (evt) => {
    setQuery(evt.currentTarget.value)
  }

  return (
    <div className="flex flex-row justify-between items-center mt-4">
      <div className="flex flex-row items-center outline border-2 focus-within:border-blue-500 flex-grow">
        <div className="relative flex-grow">
          <Form ref={formRef} method='get' action='/search-results'>
            <input
              className="block text-lg p-4 w-full appearance-none focus:outline-none bg-transparent resize-none"
              name="query"
              id="searchInput"
              placeholder="Search"
              type="text"
              value={query}
              onInput={onInput}
            />
          </Form>
        </div>

        {query && (
          <div className="flex flex-row items-center">
            <button
              className="rounded-full hover:text-blue-500 focus:outline-none focus:ring focus:border-blue-500 ml-1"
              type="button"
              // eslint-disable-next-line react-hooks/rules-of-hooks
              onClick={() => { useTextToSpeech(query, createErrorNotification); }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="md:h-10 md:w-10 h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z" clipRule="evenodd" />
              </svg>
            </button>

            <Link
              className="rounded-full hover:text-blue-500 focus:outline-none focus:ring focus:border-blue-500 mx-1"
              type="button"
              to="/"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="md:h-10 md:w-10 h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </Link>
          </div>
        )}
      </div>

      <Link
        className="md:h-16 md:w-16 h-8 w-8 rounded-full hover:text-blue-500 ml-2 focus:outline-none focus:ring focus:border-blue-500"
        type="button"
        aria-label="Activate Speech to Text"
        to={location.hash !== "#voice-module" ? voiceModuleUrl : location.pathname + location.search}
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
        </svg>
      </Link>

      <Link
        className="md:h-16 md:w-16 h-8 w-8 rounded-full hover:text-blue-500 ml-2 focus:outline-none focus:ring focus:border-blue-500"
        type="button"
        aria-label="Find Text in Photo"
        to={location.hash !== "#image-module" ? imageModuleUrl : location.pathname + location.search}
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
        </svg>
      </Link>
    </div>
  );
};

export default SearchBar;
