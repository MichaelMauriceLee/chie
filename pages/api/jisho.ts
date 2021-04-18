import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';
import { SearchResult } from '../../models/SearchResult';

const jishoSearchWordBaseUrl = 'https://jisho.org/api/v1/search/words?keyword=';

export const fetchWordDefinitions = async (keyword: string): Promise<SearchResult[]> => {
  const url = jishoSearchWordBaseUrl + encodeURIComponent(keyword);
  const { data } = await axios.get(url);
  return data.data;
};

const jisho = async (req: NextApiRequest, res: NextApiResponse): Promise<void> => {
  let { keyword } = req.query;
  keyword = decodeURIComponent(keyword as string);
  if (!keyword) {
    throw new Error('Must send a keyword');
  }
  res.status(200).json(await fetchWordDefinitions(keyword));
};

export default jisho;
