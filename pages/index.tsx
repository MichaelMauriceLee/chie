import React from 'react';
import Info from '../components/Info';
import SearchResultItemSkeleton from '../components/SearchResult/SearchResultItemSkeleton';
import usePageTransition from '../hooks/usePageTransition';

const Home: React.FC = () => {
  const isLoading = usePageTransition();

  if (isLoading) {
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
    <Info />
  );
};

export default Home;
