import React from 'react';

const SearchResultItemSkeleton: React.FC = () => (
  <div className="grid md:grid-cols-3 grid-cols-1 gap-4 rounded-md border border-blue-400 animate-pulse">
    <div className="col-span-1 md:pl-7 md:pr-0 md:pt-2 md:pb-2 px-2 pt-2">
      <div className="h-14 bg-blue-400 rounded w-3/4" />
      <div className="h-6 bg-blue-400 rounded w-3/4 mt-2" />
    </div>

    <div className="md:col-span-2 col-span-1 md:pl-0 pl-2 py-2 space-y-4">
      <div className="h-6 bg-blue-400 rounded w-1/4" />
      <div className="h-6 bg-blue-400 rounded w-3/4" />
      <div className="h-6 bg-blue-400 rounded w-1/2" />

      <div className="h-6 bg-blue-400 rounded w-1/4" />
      <div className="h-4 bg-blue-400 rounded w-1/2" />
    </div>
  </div>
);

export default SearchResultItemSkeleton;
