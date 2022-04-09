export enum HttpMethods {
  get = 'GET',
  post = 'POST'
}

export const jishoSearchWordBaseUrl = '/resources/jisho';
export const ocrBaseUrl = '/resources/analyzeImage';
export const speechTokenUrl = '/resources/speechToken';
export const translationTokenUrl = '/resources/translationToken';

export const translationUrl = 'https://api.cognitive.microsofttranslator.com/translate?api-version=3.0';

export const ankiBaseUrl = 'http://127.0.0.1:8765';
export const ankiConnectVersion = 6;

export enum AnkiConnectActionType {
  deckNames = 'deckNames',
  addNote = 'addNote',
  findNotes = 'findNotes',
  notesInfo = 'notesInfo'
}
