import React, { useEffect, useState } from 'react';
import Head from 'next/head';

import NavBar from '../components/NavBar';
import SearchBar from '../components/SearchBar';
import SearchResultList from '../components/SearchResult/SearchResultList';
import Modal from '../components/Modal/Modal';
import ImageArea from '../components/ImageArea/ImageArea';
import Info from '../components/Info';
import useDeckNames from '../hooks/useDeckNames';
import useCurrentDeckNotes from '../hooks/useCurrentDeckNotes';
import useSearchResult from '../hooks/useSearchResult';
import useNotification from '../hooks/useNotification';
import { NotificationType } from '../models/Notification';
import VoiceArea from '../components/VoiceArea/VoiceArea';
import useTranslation from '../hooks/useTranslation';
import Translation from '../components/Translation/Translation';

const Home: React.FC = () => {
  const [keyword, setKeyword] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [isConnectedToAnki, setIsConnectedToAnki] = useState(false);
  const [currentDeckName, setCurrentDeckName] = useState<string | null>(typeof window !== 'undefined' ? localStorage.getItem('currentDeck') : null);
  const [showImageArea, setShowImageArea] = useState(false);
  const [showVoiceArea, setShowVoiceArea] = useState(false);
  const [image, setImage] = useState<File | null>(null);
  const [showInfo, setShowInfo] = useState(true);

  const dispatch = useNotification();
  const createErrorNotification = (error: Error) => {
    dispatch({
      type: NotificationType.Error,
      message: error.message,
    });
  };

  const {
    data: searchResults, isLoading: isDictionaryLoading, refetch: fetchSearchResults,
  } = useSearchResult(keyword, createErrorNotification);

  const {
    data: translationResults, isLoading: isTranslationLoading, refetch: fetchTranslation,
  } = useTranslation(keyword, createErrorNotification);

  const { data: deckList } = useDeckNames(setIsConnectedToAnki);
  const { data: currentDeckNotes } = useCurrentDeckNotes(
    setIsConnectedToAnki, currentDeckName ?? '',
  );

  const searchWord = () => {
    fetchSearchResults();
    fetchTranslation();
  };

  // if there isnt any currentDeckName, assign one
  // (will either be there or will be undefined since couldn't get one)
  useEffect(() => {
    if (!currentDeckName && deckList && deckList.length !== 0) {
      setCurrentDeckName(deckList[0]);
    }
  }, [isConnectedToAnki]);

  return (
    <div>
      <Head>
        <title>Chie</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="md:px-72 px-2">
        {showModal
          && (
            <Modal
              isConnectedToAnki={isConnectedToAnki}
              setShowModal={setShowModal}
              showModal={showModal}
              currentDeckName={currentDeckName}
              setCurrentDeckName={setCurrentDeckName}
              deckList={deckList ?? []}
            />
          )}
        <NavBar setShowModal={setShowModal} />

        <SearchBar
          keyword={keyword}
          setKeyword={setKeyword}
          setShowImageArea={setShowImageArea}
          setShowVoiceArea={setShowVoiceArea}
          fetchSearchResults={searchWord}
          setShowInfo={setShowInfo}
        />

        {showImageArea && <ImageArea image={image} setImage={setImage} setKeyword={setKeyword} />}
        {showVoiceArea && <VoiceArea />}

        <div className="grid md:grid-cols-4 grid-cols-1 gap-2">
          <div className="col-span-3">
            <SearchResultList
              searchResults={searchResults ?? []}
              isLoading={isDictionaryLoading}
              isConnectedToAnki={isConnectedToAnki}
              currentDeckName={currentDeckName}
              currentDeckNotes={currentDeckNotes ?? {}}
            />
          </div>
          <div className="col-span-1">
            <Translation
              sentence={translationResults ?? []}
              isLoading={isTranslationLoading}
            />
          </div>
        </div>

        {showInfo && <Info />}
      </main>
    </div>
  );
};

export default Home;
