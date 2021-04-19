import { useContext } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { NotificationActionType, NotificationType } from '../models/Notification';
import { NotificationContext } from '../components/Provider/NotificationProvider';

interface UseNotification {
  createErrorNotification: (error?: Error) => void
  createSuccessNotification: (message?: string) => void
}

const useNotification = (): UseNotification => {
  const dispatch = useContext(NotificationContext);

  const createNotification = (message: string, type: NotificationType) => {
    if (dispatch) {
      dispatch({
        type: NotificationActionType.addNotification,
        payload: {
          id: uuidv4(),
          message,
          type,
        },
      });
    }
  };

  const createErrorNotification = (error?: Error) => {
    const errorMessage = error ? error.message : 'Failed';
    createNotification(errorMessage, NotificationType.Error);
  };

  const createSuccessNotification = (message?: string) => {
    const successMessage = message ?? 'Success';
    createNotification(successMessage, NotificationType.Success);
  };

  return { createErrorNotification, createSuccessNotification };
};

export default useNotification;
