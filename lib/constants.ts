export const ANKI_BASE_URL = "http://localhost:8765";
export const ANKI_CONNECT_VERSION = 6;

export enum AnkiConnectActionType {
  deckNames = "deckNames",
  addNote = "addNote",
  findNotes = "findNotes",
  notesInfo = "notesInfo",
}
