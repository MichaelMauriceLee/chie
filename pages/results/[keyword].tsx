import React from 'react';
import { GetStaticPaths, GetStaticProps } from 'next';
import { ParsedUrlQuery } from 'querystring';
import axios from 'axios';
import { useRouter } from 'next/router';
import wordList from '../../utils/wordList';
import { SearchResult } from '../../models/SearchResult';
import SearchResultItemSkeleton from '../../components/SearchResult/SearchResultItemSkeleton';
import SearchResultItem from '../../components/SearchResult/SearchResultItem';
import usePageTransition from '../../hooks/usePageTransition';

interface SearchResultPageProps {
  keyword: string;
  searchResults: SearchResult[];
}

const SearchResultPage: React.FC<SearchResultPageProps> = ({ searchResults }) => {
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
      <div className="col-span-1">
        {/* <TranslationDisplay
            sentence={translation}
            key={JSON.stringify(translation)}
          /> */}
      </div>
    </div>
  );
};

export const getStaticProps: GetStaticProps = async (context) => {
  // @ts-expect-error ignore for now
  const { keyword } = context.params;
  const { data } = await axios.get(`https://jisho.org/api/v1/search/words?keyword=${encodeURIComponent(keyword)}`);
  const searchResults = data.data;
  return {
    props: {
      keyword,
      searchResults,
    },
  };
};

export const getStaticPaths: GetStaticPaths = async () => {
  const paths: { params: ParsedUrlQuery }[] = [];
  wordList.forEach((word) => {
    const path = { params: { keyword: word } };
    paths.push(path);
  });
  return {
    paths,
    fallback: true,
  };
};

export default SearchResultPage;
