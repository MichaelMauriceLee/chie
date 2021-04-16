import { Note } from './Note';
import { AnkiConnectActionType } from '../services/constants';

interface AnkiRequest {
  action: AnkiConnectActionType;
  version: number;
}

export interface AddCardRequest extends AnkiRequest {
  params: {
    note?: Note;
  };
}

export type GetDeckNamesRequest = AnkiRequest

export interface FindNotesRequest extends AnkiRequest {
  params: {
    query: string;
  };
}

export interface NotesInfoRequest extends AnkiRequest {
  params: {
    notes: number[];
  };
}
