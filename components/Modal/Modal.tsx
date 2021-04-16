import React, { useState, useEffect } from 'react';
import NoConnection from './NoConnection';
import AnkiDeckSelect from './AnkiDeckSelect';

interface ModalProps {
  isConnectedToAnki: boolean;
  currentDeckName: string | null;
  setCurrentDeckName: (param: string | null) => void;
  showModal: boolean;
  setShowModal: (param: boolean) => void;
  deckList: string[];
}

const Modal: React.FC<ModalProps> = ({
  isConnectedToAnki, setShowModal, setCurrentDeckName, currentDeckName, deckList, showModal,
}) => {
  const [newCurrentName, setNewCurrentName] = useState<string | null>(null);
  const [backgroundOpacity, setBackgroundOpacity] = useState('opacity-0');
  const [modalPanelDisplayOptions, setModalPanelDisplayOptions] = useState('opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95');
  const closeModalAnimationDuration = 200;

  const setModalDisplayOn = () => {
    setBackgroundOpacity('opacity-100');
    setModalPanelDisplayOptions('opacity-100 translate-y-0 sm:scale-100');
  };

  const setModalDisplayOff = () => {
    setBackgroundOpacity('opacity-0');
    setModalPanelDisplayOptions('opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95');
  };

  const close = () => {
    setModalDisplayOff();
    // gives time for animation to play out before unmounting modal from DOM
    setTimeout(() => { setShowModal(false); }, closeModalAnimationDuration);
  };

  const save = () => {
    if (newCurrentName) {
      setCurrentDeckName(newCurrentName);
      localStorage.setItem('currentDeck', newCurrentName);
    }
    close();
  };

  useEffect(() => {
    if (showModal) {
      setModalDisplayOn();
    } else {
      setModalDisplayOff();
    }
  }, [showModal]);

  useEffect(() => {
    setNewCurrentName(currentDeckName);
  }, [currentDeckName]);

  return (
    <div className="fixed z-10 inset-0 overflow-y-auto">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Background Overlay, show/hide based on modal state. */}
        <div
          className={`${showModal ? `ease-in duration-${closeModalAnimationDuration}` : 'ease-out duration-300'} fixed inset-0 transition-opacity ${backgroundOpacity}`}
          aria-hidden="true"
        >
          <div className="absolute inset-0 bg-gray-500 opacity-75" />
        </div>

        {/* This element is to trick the browser into centering the modal contents. */}
        <span
          className="hidden sm:inline-block sm:align-middle sm:h-screen"
          aria-hidden="true"
        >
          &#8203;
        </span>

        {/* Modal Panel, show/hide based on modal state. */}
        <div
          className={`${showModal ? `ease-in duration-${closeModalAnimationDuration}` : 'ease-out duration-300'} ${modalPanelDisplayOptions}
          inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full`}
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-headline"
        >
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            {isConnectedToAnki ? (
              <AnkiDeckSelect
                currentDeckName={newCurrentName}
                setCurrentDeckName={setNewCurrentName}
                deckList={deckList}
              />
            ) : <NoConnection />}
          </div>

          {/* Actions Bar */}
          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            {isConnectedToAnki
            && (
              <button
                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-500 text-base font-medium text-white
              hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                type="button"
                onClick={save}
              >
                Save
              </button>
            )}

            <button
              className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2
              bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2
              focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
              type="button"
              onClick={close}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Modal;
