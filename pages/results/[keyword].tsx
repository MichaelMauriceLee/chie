import React from 'react';
import { GetStaticPaths, GetStaticProps } from 'next';
import { ParsedUrlQuery } from 'querystring';
import { useRouter } from 'next/router';
import axios from 'axios';
import { SearchResult } from '../../models/SearchResult';
import SearchResultItemSkeleton from '../../components/SearchResult/SearchResultItemSkeleton';
import SearchResultItem from '../../components/SearchResult/SearchResultItem';
import usePageTransition from '../../hooks/usePageTransition';
import TranslationDisplay from '../../components/Translation/TranslationDisplay';
import { TranslateLineRequest, TranslateLineResponse } from '../../models/Translation';

interface SearchResultPageProps {
  keyword: string;
  searchResults: SearchResult[];
  translation: TranslateLineResponse
}

const SearchResultPage: React.FC<SearchResultPageProps> = ({ searchResults, translation }) => {
  const { isFallback } = useRouter();
  const isLoading = usePageTransition();

  if (isFallback || isLoading) {
    return (
      <div className="grid md:grid-cols-4 grid-cols-1 gap-2">
        <div className="col-span-3">
          <div className="mt-2 space-y-4">
            <SearchResultItemSkeleton />
            <SearchResultItemSkeleton />
            <SearchResultItemSkeleton />
          </div>
        </div>
        <div className="col-span-1">
          <div className="mt-2">
            <div className="rounded-md border border-blue-400 px-2 py-1 h-96 animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid md:grid-cols-4 grid-cols-1 gap-2">
      <div className="col-span-3">
        <div className="mt-2 space-y-4">
          { searchResults.map((searchResult) => (
            <SearchResultItem
              key={JSON.stringify(searchResult)}
              searchResult={searchResult}
            />
          ))}
        </div>
      </div>
      <div className="mt-2 col-span-1">
        <TranslationDisplay
          sentence={translation}
          key={JSON.stringify(translation)}
        />
      </div>
    </div>
  );
};

interface Params extends ParsedUrlQuery {
  keyword: string,
}

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const { keyword } = params as Params;

  const fetchWordDefinitions = async (): Promise<SearchResult[]> => {
    const jishoSearchWordBaseUrl = 'https://jisho.org/api/v1/search/words?keyword=';
    const url = jishoSearchWordBaseUrl + encodeURIComponent(keyword);
    const { data } = await axios.get(url);
    return data.data;
  };

  const fetchTranslation = async (): Promise<TranslateLineResponse> => {
    const translationUrl = 'https://api.cognitive.microsofttranslator.com/translate?api-version=3.0';

    const payload: TranslateLineRequest[] = [
      {
        Text: keyword,
      },
    ];

    const url = `${translationUrl}&to=en`;

    const { data } = await axios.post(url, payload, {
      headers: {
        'Ocp-Apim-Subscription-Key': process.env.TRANSLATION_KEY,
        'Ocp-Apim-Subscription-Region': process.env.TRANSLATION_REGION,
      },
    });

    return data[0];
  };

  const [searchResults, translation] = await Promise.all([
    fetchWordDefinitions(),
    fetchTranslation(),
  ]);

  return {
    props: {
      keyword,
      searchResults,
      translation,
    },
  };
};

export const getStaticPaths: GetStaticPaths = async () => ({
  paths: [],
  fallback: true,
});

export default SearchResultPage;
