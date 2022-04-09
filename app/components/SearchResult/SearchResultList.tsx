import React from 'react';
import { SearchResult } from '../../models/SearchResult';
import SearchResultItem from './SearchResultItem';
import SearchResultItemSkeleton from './SearchResultItemSkeleton';

interface SearchResultListProps {
  searchResults: SearchResult[];
  isLoading: boolean;
}

const SearchResultList: React.FC<SearchResultListProps> = ({
  // eslint-disable-next-line max-len
  searchResults, isLoading,
}) => (
  <div className="mt-2 space-y-4">
    { isLoading
      ? (
        <>
          <SearchResultItemSkeleton />
          <SearchResultItemSkeleton />
          <SearchResultItemSkeleton />
        </>
      )
      : searchResults.map((searchResult) => (
        <SearchResultItem
          key={JSON.stringify(searchResult)}
          searchResult={searchResult}
        />
      ))}
  </div>
);

export default SearchResultList;
