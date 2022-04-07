import { LoaderFunction } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import SearchResultItem from '~/components/SearchResultItem';
import SearchResultItemSkeleton from '~/components/SearchResultItemSkeleton';
import { SearchResult } from '~/models/SearchResult';

type LoaderData = { data: SearchResult[] };

export const loader: LoaderFunction = async ({ request }) => {
  const jishoSearchWordBaseUrl = 'https://jisho.org/api/v1/search/words?keyword=';

  const url = new URL(request.url)
  const search = new URLSearchParams(url.search);
  const jishoUrl = jishoSearchWordBaseUrl + encodeURIComponent(search.get("query") as string);
  const response = await fetch(jishoUrl)
  const data = await response.json()

  return data;
};

export default function SearchResultsList () {
  const data = useLoaderData<LoaderData>();

  return (
    <div className="mt-2 space-y-4">
      {data.data
        ? data.data.map((searchResult) => (
          <SearchResultItem
            key={JSON.stringify(searchResult)}
            searchResult={searchResult}
          />
        ))
        :
        (
          <>
            <SearchResultItemSkeleton />
            <SearchResultItemSkeleton />
            <SearchResultItemSkeleton />
          </>
        )
      }
    </div>
  );
}

