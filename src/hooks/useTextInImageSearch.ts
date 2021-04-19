import { AxiosError } from 'axios';
import { useQuery, UseQueryResult } from 'react-query';
import { ImageSearchResult } from '../models/ImageSearchResult';
import { postAnalyzeImageRequest, getAnalysisResults } from '../services/agent';

const fetchTextInImageSearchResults = async (image: File) => {
  try {
    const analysisId = await postAnalyzeImageRequest(image);
    let results;
    for (let i = 0; i < 30 && !results; i += 1) {
      // eslint-disable-next-line no-await-in-loop
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // eslint-disable-next-line no-await-in-loop
      results = await getAnalysisResults(analysisId);
    }
    return results;
  } catch (err) {
    if (err.response) {
      throw err;
    } else {
      throw new Error('Failed to get text in image');
    }
  }
};

const useTextInImageSearch = (image: File, errorCallback?: (error: AxiosError) => void): UseQueryResult<ImageSearchResult[], AxiosError> => useQuery(['textInImage', `${image.name}-${image.size}-${image.lastModified}`],
  () => fetchTextInImageSearchResults(image),
  {
    enabled: false,
    onError: (error: AxiosError) => { if (errorCallback) { errorCallback(error); } },
    retry: (_, error: AxiosError) => {
      if (error.response && error.response.status === 400) {
        return false;
      }
      return true;
    },
  });

export default useTextInImageSearch;
