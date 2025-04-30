import { Note } from "./note";
import { AnkiConnectActionType } from "../lib/constants";

export type AnkiRequest = {
  action: AnkiConnectActionType;
  version: number;
};

export type AddCardRequest = AnkiRequest & {
  params: {
    note?: Note;
  };
};

export type FindNotesRequest = AnkiRequest & {
  params: {
    query: string;
  };
};

export type NotesInfoRequest = AnkiRequest & {
  params: {
    notes: number[];
  };
};
