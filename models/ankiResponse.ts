export type AnkiResponse = {
  result: unknown;
  error: string | null;
};

export type NotesInfoResponse = {
  noteId: string;
  modelName: string;
  tags: string[];
  fields: {
    Front: {
      value: string;
      order: number;
    };
    Back: {
      value: string;
      order: number;
    };
  };
};
