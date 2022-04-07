import React, { useState, useEffect, Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import NoConnection from './NoConnection';
import AnkiDeckSelect from './AnkiDeckSelect';
import useSettings from '../../hooks/useSettings';
import useAnkiInfo from '../../hooks/anki/useAnkiInfo';
import { SettingsActionType } from '../Provider/SettingsProvider';
import ButtonRow from './ButtonRow';

interface ModalProps {
  showModal: boolean;
  toggleModal: () => void;
}

const Modal: React.FC<ModalProps> = ({ toggleModal, showModal }) => {
  const [newCurrentName, setNewCurrentName] = useState<string>('');
  const { isConnectedToAnki, deckList } = useAnkiInfo();
  const { state, dispatch } = useSettings();

  const setCurrentDeckName = (name: string) => {
    if (dispatch) {
      dispatch({
        type: SettingsActionType.changeCurrentDeckName,
        payload: name,
      });
    }
  };

  const save = () => {
    if (newCurrentName) {
      setCurrentDeckName(newCurrentName);
      localStorage.setItem('currentDeck', newCurrentName);
    }
    toggleModal();
  };

  useEffect(() => {
    if (state?.currentDeckName) {
      setNewCurrentName(state.currentDeckName);
    }
  }, [state?.currentDeckName]);

  return (
    <Transition
      show={showModal}
      enter="transition duration-100 ease-out"
      enterFrom="transform scale-95 opacity-0"
      enterTo="transform scale-100 opacity-100"
      leave="transition duration-75 ease-out"
      leaveFrom="transform scale-100 opacity-100"
      leaveTo="transform scale-95 opacity-0"
    >
      <Dialog
        className="fixed z-10 inset-0 overflow-y-auto"
        static
        open={showModal}
        onClose={toggleModal}
      >
        <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Dialog.Overlay className="fixed inset-0 bg-black opacity-30" />
          </Transition.Child>

          {/* This element is to trick the browser into centering the modal contents. */}
          <span
            className="sm:inline-block sm:align-middle sm:h-screen"
            aria-hidden="true"
          >
            &#8203;
          </span>

          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <div className="inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left
            align-middle transition-all transform bg-white shadow-xl rounded-md"
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

              <ButtonRow
                isConnectedToAnki={isConnectedToAnki}
                save={save}
                toggleModal={toggleModal}
              />
            </div>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  );
};

export default Modal;
