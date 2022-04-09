import { LoaderFunction } from '@remix-run/node';
import axios from 'axios';

const jishoSearchWordBaseUrl = 'https://jisho.org/api/v1/search/words?keyword=';

export const loader: LoaderFunction = async ({ request }) => {
  const url = new URL(request.url);
  const query = url.searchParams.get("keyword");
  const keyword = decodeURIComponent(query ?? '');
  if (!query) {
    throw new Error('Must send a keyword');
  }
  const jishoUrl = jishoSearchWordBaseUrl + encodeURIComponent(keyword);
  const { data } = await axios.get(jishoUrl);
  return data
};
