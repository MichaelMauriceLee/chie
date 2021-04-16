import React, { createContext, useReducer } from 'react';
import Notification from './Notification';
import { NotificationActionType, NotificationType } from '../../models/Notification';

export interface NotificationAction {
  type: NotificationActionType;
  payload: NotificationModel;
}

export interface NotificationModel {
  id: string;
  message?: string;
  type?: NotificationType;
}

export const NotificationContext = createContext<React.Dispatch<NotificationAction> | null>(null);

const NotificationProvider: React.FC = ({ children }) => {
  const reducer = (state: NotificationModel[], action: NotificationAction): NotificationModel[] => {
    switch (action.type) {
      case NotificationActionType.addNotification:
        return [...state, { ...action.payload }];
      case NotificationActionType.removeNotification:
        return state.filter((el) => el.id !== action.payload.id);
      default:
        return state;
    }
  };

  const [state, dispatch] = useReducer(reducer, []);

  return (
    <NotificationContext.Provider value={dispatch}>
      <div className="fixed md:top-4 md:right-4 md:transform-none top-1 right-1/2 transform translate-x-1/2 w-72 space-y-1 z-10">
        {state.map((note) => (
          <Notification
            key={note.id}
            dispatch={dispatch}
            id={note.id}
            message={note.message}
            type={note.type}
          />
        ))}
      </div>

      {children}
    </NotificationContext.Provider>
  );
};

export default NotificationProvider;
