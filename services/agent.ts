import axios from 'axios';
import Cookie from 'universal-cookie';
import {
  jishoSearchWordBaseUrl,
  ankiBaseUrl,
  ankiConnectVersion,
  HttpMethods,
  AnkiConnectActionType,
  ocrBaseUrl,
  speechTokenUrl,
  translationTokenUrl,
  translationUrl,
} from './constants';
import {
  AddCardRequest,
  FindNotesRequest,
  GetDeckNamesRequest,
  NotesInfoRequest,
} from '../models/AnkiRequest';
import { AnkiResponse, NotesInfoResponse } from '../models/AnkiResponse';
import { Note } from '../models/Note';
import { SearchResult } from '../models/SearchResult';
import { ImageSearchResult } from '../models/ImageSearchResult';
import { TokenResponse } from '../models/TokenResponse';
import { TranslateLineRequest, TranslateLineResponse } from '../models/Translation';

const formatAnkiResponse = async <T>(res: Response): Promise<T> => {
  const { result, error }: AnkiResponse = await res.json();
  if (error) {
    // need to throw error manually since with anki api
    throw new Error(error.charAt(0).toUpperCase() + error.slice(1));
  }
  return result as T;
};

export const getDeckNames = async (): Promise<string[]> => {
  const payload: GetDeckNamesRequest = {
    action: AnkiConnectActionType.deckNames,
    version: ankiConnectVersion,
  };
  const response = await fetch(ankiBaseUrl, {
    method: HttpMethods.post,
    body: JSON.stringify(payload),
  });
  return formatAnkiResponse<string[]>(response);
};

export const getCurrentDeckNotes = async (
  deckName: string,
): Promise<NotesInfoResponse[]> => {
  const payload: FindNotesRequest = {
    action: AnkiConnectActionType.findNotes,
    version: ankiConnectVersion,
    params: { query: `deck:"${deckName}"` },
  };
  const response = await fetch(ankiBaseUrl, {
    method: HttpMethods.post,
    body: JSON.stringify(payload),
  });
  const noteIdArray = await formatAnkiResponse<number[]>(response);
  const newPayload: NotesInfoRequest = {
    action: AnkiConnectActionType.notesInfo,
    version: ankiConnectVersion,
    params: { notes: noteIdArray },
  };
  const newResponse = await fetch(ankiBaseUrl, {
    method: HttpMethods.post,
    body: JSON.stringify(newPayload),
  });
  return formatAnkiResponse<NotesInfoResponse[]>(newResponse);
};

export const postNote = async (note: Note): Promise<string> => {
  const payload: AddCardRequest = {
    action: AnkiConnectActionType.addNote,
    version: ankiConnectVersion,
    params: { note },
  };
  const response = await fetch(ankiBaseUrl, {
    method: HttpMethods.post,
    body: JSON.stringify(payload),
  });
  return formatAnkiResponse<string>(response);
};

export const getSearchResults = async (
  keyword: string,
): Promise<SearchResult[]> => {
  const { data } = await axios.get(
    `${jishoSearchWordBaseUrl}?keyword=${keyword}`,
  );
  return data.data;
};

export const postAnalyzeImageRequest = async (image: File): Promise<string> => {
  const { data } = await axios.post(ocrBaseUrl, image, {
    headers: {
      'Content-Type': 'application/octet-stream',
    },
  });
  return data;
};

export const getAnalysisResults = async (
  analysisId: string,
): Promise<ImageSearchResult[] | null> => {
  const { data } = await axios.get(`${ocrBaseUrl}/results/${analysisId}`);
  const { status, analyzeResult } = data;
  if (status === 'succeeded') {
    return analyzeResult.readResults;
  }
  if (status === 'failed') {
    throw new Error('Read failed');
  }
  return null;
};

export const getTranslation = async (
  payload: TranslateLineRequest[], accessToken: string, to: string, from?: string,
): Promise<TranslateLineResponse[]> => {
  const url = from ? `${translationUrl}&from=${from}&to=${to}` : `${translationUrl}&to=${to}`;
  const { data } = await axios.post(url, payload, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  return data;
};

export const getSpeechToken = async (): Promise<TokenResponse> => {
  const cookie = new Cookie();
  const speechToken = cookie.get('speech-token');

  if (!speechToken) {
    try {
      const res = await axios.get(speechTokenUrl);
      const { token, region } = res.data;
      cookie.set('speech-token', `${region}:${token}`, { maxAge: 540, path: '/' });
      return { token, region };
    } catch (err) {
      throw new Error(err.message ?? err);
    }
  } else {
    const idx = speechToken.indexOf(':');
    return { token: speechToken.slice(idx + 1), region: speechToken.slice(0, idx) };
  }
};

export const getTranslationToken = async (): Promise<TokenResponse> => {
  const cookie = new Cookie();
  const translationToken = cookie.get('translation-token');

  if (!translationToken) {
    try {
      const res = await axios.get(translationTokenUrl);
      const { token, region } = res.data;
      cookie.set('translation-token', `${region}:${token}`, { maxAge: 540, path: '/' });
      return { token, region };
    } catch (err) {
      throw new Error(err.message ?? err);
    }
  } else {
    const idx = translationToken.indexOf(':');
    return { token: translationToken.slice(idx + 1), region: translationToken.slice(0, idx) };
  }
};
