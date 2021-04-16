import {
  QueryClient, useMutation, UseMutationResult,
} from 'react-query';
import { Note } from '../models/Note';
import { postNote } from '../services/agent';

const addNoteToCurrentDeck = async (card: Note) => {
  try {
    const data = await postNote(card);
    return data;
  } catch (error) {
    throw new Error(error.message ?? 'Failed to create note');
  }
};

const useCreateNote = (
  queryClient: QueryClient,
  successCallback?: () => void,
  errorCallback?: (error: Error) => void,
): UseMutationResult<string, Error, Note, unknown> => useMutation(
  addNoteToCurrentDeck,
  {
    onSuccess: () => {
      if (successCallback) {
        successCallback();
      }
      queryClient.invalidateQueries('currentDeckNotes');
    },
    onError: (error: Error) => { if (errorCallback) { errorCallback(error); } },
  },
);

export default useCreateNote;
