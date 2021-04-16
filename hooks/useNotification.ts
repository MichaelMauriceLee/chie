import { useContext } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { NotificationActionType, NotificationType } from '../models/Notification';
import { NotificationContext } from '../components/Notifications/NotificationProvider';

interface NotificationPayload {
  message: string;
  type: NotificationType;
}

const useNotification = (): (props: NotificationPayload) => void => {
  const dispatch = useContext(NotificationContext);

  return (props: NotificationPayload) => {
    if (dispatch) {
      dispatch({
        type: NotificationActionType.addNotification,
        payload: {
          id: uuidv4(),
          ...props,
        },
      });
    }
  };
};

export default useNotification;
