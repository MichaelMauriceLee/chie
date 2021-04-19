/* global NodeJS */
import React, { useEffect, useState } from 'react';
import { NotificationActionType } from '../../models/Notification';
import { NotificationAction, NotificationModel } from '../Provider/NotificationProvider';

interface NotificationProps extends NotificationModel {
  dispatch: React.Dispatch<NotificationAction>;
}

const Notification: React.FC<NotificationProps> = ({
  message, id, type, dispatch,
}) => {
  const [exit, setExit] = useState(false);
  const [width, setWidth] = useState(0);
  const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null);

  const handleStartTimer = () => {
    const intId = setInterval(() => {
      setWidth((prev) => {
        if (prev < 100) {
          return prev + 0.5;
        }
        clearInterval(intId);
        return prev;
      });
    }, 20);
    setIntervalId(intId);
  };

  const handlePauseTimer = () => {
    if (intervalId) {
      clearInterval(intervalId);
    }
  };

  const handleCloseNotification = () => {
    handlePauseTimer();
    setExit(true);
    dispatch({
      type: NotificationActionType.removeNotification,
      payload: {
        id,
      },
    });
  };

  useEffect(() => {
    if (width === 100) {
      handleCloseNotification();
    }
  }, [width]);

  useEffect(() => {
    handleStartTimer();
  }, []);

  return (
    <div
      className={`opacity-50 w-72 shadow-md notification-item rounded-md
        p-1 overflow-hidden ${type === 'SUCCESS' ? 'bg-green-500' : 'bg-red-500'} ${exit ? 'exit' : ''}`}
      onMouseEnter={handlePauseTimer}
      onMouseLeave={handleStartTimer}
    >
      <div className="flex flex-row items-center justify-between pb-2">
        <p className="text-white ml-2">{message}</p>

        <button
          className="bg-blue-200 hover:bg-blue-500 text-white rounded-full flex items-center justify-center mr-2"
          type="button"
          onClick={handleCloseNotification}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </div>

      <div className="h-1 bg-white" style={{ width: `${width}%` }} />
    </div>
  );
};

export default Notification;
