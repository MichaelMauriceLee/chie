import type { LoaderFunction } from '@remix-run/node';
import axios from 'axios';

const jishoSearchWordBaseUrl = 'https://jisho.org/api/v1/search/words?keyword=';
const headers = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/111.0.0.0 Safari/537.36'
}

export const loader: LoaderFunction = async ({ request }) => {
  const url = new URL(request.url);
  const query = url.searchParams.get("keyword");
  const keyword = decodeURIComponent(query ?? '');
  if (!query) {
    throw new Error('Must send a keyword');
  }
  const jishoUrl = jishoSearchWordBaseUrl + encodeURIComponent(keyword);

  const response = await axios.get(jishoUrl, { headers });
  return response.data
};
