import React from 'react';
import { SearchResult } from '../../models/SearchResult';
import SearchResultItem from './SearchResultItem';
import SearchResultItemSkeleton from './SearchResultItemSkeleton';

interface SearchResultListProps {
  searchResults: SearchResult[];
  isLoading: boolean;
  isConnectedToAnki: boolean;
  currentDeckName: string | null;
  currentDeckNotes: Record<string, boolean>;
}

const SearchResultList: React.FC<SearchResultListProps> = ({
  // eslint-disable-next-line max-len
  searchResults, isLoading, isConnectedToAnki, currentDeckName, currentDeckNotes,
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
          isConnectedToAnki={isConnectedToAnki}
          currentDeckName={currentDeckName}
          currentDeckNotes={currentDeckNotes}
        />
      ))}
  </div>
);

export default SearchResultList;
