export interface AnkiResponse {
  result: unknown;
  error: string | null;
}

export interface NotesInfoResponse {
  noteId: string;
  modelName: string;
  tags: string[];
  fields: {
    Front: {
      value: string;
      order: number;
    }
    Back: {
      value: string;
      order: number;
    }
  }
}
