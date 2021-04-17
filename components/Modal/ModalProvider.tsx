import React, { createContext, useState } from 'react';
import Modal from './Modal';

export const ModalContext = createContext({});

const ModalProvider: React.FC = ({ children }) => {
  const [showModal, setShowModal] = useState(false);

  const toggleModal = () => {
    setShowModal((prev) => !prev);
  };
  return (
    <ModalContext.Provider value={toggleModal}>
      {showModal && <Modal showModal={showModal} toggleModal={toggleModal} />}

      {children}
    </ModalContext.Provider>
  );
};

export default ModalProvider;
