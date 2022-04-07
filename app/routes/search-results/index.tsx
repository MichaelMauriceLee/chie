import { LoaderFunction } from '@remix-run/node';
import { useLoaderData, useSearchParams } from '@remix-run/react';
import SearchResultItem from '~/components/SearchResult/SearchResultItem';
import SearchResultItemSkeleton from '~/components/SearchResult/SearchResultItemSkeleton';
import Translation from '~/components/Translation/Translation';
import useNotification from '~/hooks/useNotification';
import useTranslation from '~/hooks/useTranslation';
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
  const { createErrorNotification } = useNotification();

  const [params] = useSearchParams()

  const {
    data: translationResults, isLoading: isTranslationLoading, refetch: fetchTranslation,
  } = useTranslation(params.get("query") as string, createErrorNotification);

  fetchTranslation()

  return (
    <div className="grid md:grid-cols-4 grid-cols-1 gap-2">
      <div className="col-span-3">
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
      <div className="col-span-1">
        <Translation
          sentence={translationResults ?? []}
          isLoading={isTranslationLoading}
        />
      </div>
    </div>
  );
}

