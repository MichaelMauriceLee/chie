import React, { useState } from 'react';
import ImageArea from '../components/ImageArea/ImageArea';
import Info from '../components/Info';
import NavBar from '../components/NavBar';
import SearchBar from '../components/SearchBar';
import SearchResultList from '../components/SearchResult/SearchResultList';
import Translation from '../components/Translation/Translation';
import VoiceArea from '../components/VoiceArea/VoiceArea';
import useNotification from '../hooks/useNotification';
import useSearchResult from '../hooks/useSearchResult';
import useTranslation from '../hooks/useTranslation';

const Home: React.FC = () => {
  const [keyword, setKeyword] = useState('');
  const [showInfo, setShowInfo] = useState(true);
  const [showImageArea, setShowImageArea] = useState(false);
  const [showVoiceArea, setShowVoiceArea] = useState(false);

  const { createErrorNotification } = useNotification();

  const {
    data: searchResults, isLoading: isDictionaryLoading, refetch: fetchSearchResults,
  } = useSearchResult(keyword, createErrorNotification);

  const {
    data: translationResults, isLoading: isTranslationLoading, refetch: fetchTranslation,
  } = useTranslation(keyword, createErrorNotification);

  const searchWord = () => {
    fetchSearchResults();
    fetchTranslation();
  };

  return (
    <main className="xl:px-72 lg:px-28 md:px-6 sm:px-4 px-2">
      <NavBar />

      <SearchBar
        keyword={keyword}
        setKeyword={setKeyword}
        setShowImageArea={setShowImageArea}
        setShowVoiceArea={setShowVoiceArea}
        fetchSearchResults={searchWord}
        setShowInfo={setShowInfo}
      />
      {showImageArea && <ImageArea setKeyword={setKeyword} />}
      {showVoiceArea && <VoiceArea />}

      <div className="grid md:grid-cols-4 grid-cols-1 gap-2">
        <div className="col-span-3">
          <SearchResultList
            searchResults={searchResults ?? []}
            isLoading={isDictionaryLoading}
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
  );
};

export default Home;
