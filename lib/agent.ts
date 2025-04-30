import {
  ANKI_BASE_URL,
  ANKI_CONNECT_VERSION,
  AnkiConnectActionType,
} from "./constants";
import {
  AddCardRequest,
  FindNotesRequest,
  AnkiRequest,
  NotesInfoRequest,
} from "../models/ankiRequest";
import { AnkiResponse, NotesInfoResponse } from "../models/ankiResponse";
import { Note } from "../models/note";

async function formatAnkiResponse<T>(res: Response): Promise<T> {
  const { result, error }: AnkiResponse = await res.json();
  if (error) {
    throw new Error(error.charAt(0).toUpperCase() + error.slice(1));
  }
  return result as T;
}

export async function getDeckNames(): Promise<string[]> {
  const payload: AnkiRequest = {
    action: AnkiConnectActionType.deckNames,
    version: ANKI_CONNECT_VERSION,
  };
  const response = await fetch(ANKI_BASE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return formatAnkiResponse<string[]>(response);
}

export async function getCurrentDeckNotes(
  deckName: string
): Promise<NotesInfoResponse[]> {
  const payload: FindNotesRequest = {
    action: AnkiConnectActionType.findNotes,
    version: ANKI_CONNECT_VERSION,
    params: { query: `deck:"${deckName}"` },
  };
  const response = await fetch(ANKI_BASE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const noteIdArray = await formatAnkiResponse<number[]>(response);

  const newPayload: NotesInfoRequest = {
    action: AnkiConnectActionType.notesInfo,
    version: ANKI_CONNECT_VERSION,
    params: { notes: noteIdArray },
  };
  const newResponse = await fetch(ANKI_BASE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(JSON.stringify(newPayload)),
  });
  return formatAnkiResponse<NotesInfoResponse[]>(newResponse);
}

export async function postNote(note: Note): Promise<string> {
  const payload: AddCardRequest = {
    action: AnkiConnectActionType.addNote,
    version: ANKI_CONNECT_VERSION,
    params: { note },
  };
  const response = await fetch(ANKI_BASE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return formatAnkiResponse<string>(response);
}
