import type { NextApiRequest, NextApiResponse } from 'next'
import axios from 'axios';

const jishoSearchWordBaseUrl = 'https://jisho.org/api/v1/search/words?keyword=';

const jisho = async (req: NextApiRequest, res: NextApiResponse) => {
  let { keyword } = req.query
  keyword = decodeURIComponent(keyword as string);
  if (!keyword) {
    throw new Error('Must send a keyword');
  }
  const url = jishoSearchWordBaseUrl + encodeURIComponent(keyword);
  const { data } = await axios.get(url);
  res.status(200).json(data)
}

export default jisho
