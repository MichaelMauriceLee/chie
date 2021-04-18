export enum HttpMethods {
  get = 'GET',
  post = 'POST'
}

export const jishoSearchWordBaseUrl = '/api/jisho';
export const ocrBaseUrl = '/api/images';
export const speechTokenUrl = '/api/speechToken';

export const ankiBaseUrl = 'http://127.0.0.1:8765';
export const ankiConnectVersion = 6;

export enum AnkiConnectActionType {
  deckNames = 'deckNames',
  addNote = 'addNote',
  findNotes = 'findNotes',
  notesInfo = 'notesInfo'
}
