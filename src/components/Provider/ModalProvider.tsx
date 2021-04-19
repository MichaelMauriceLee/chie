import React, { createContext, useState } from 'react';
import Modal from '../Modal/Modal';

export const ModalContext = createContext<(() => void) | null>(null);

const ModalProvider: React.FC = ({ children }) => {
  const [showModal, setShowModal] = useState(false);

  const toggleModal = () => {
    setShowModal((prev) => !prev);
  };
  return (
    <ModalContext.Provider value={toggleModal}>
      <Modal showModal={showModal} toggleModal={toggleModal} />

      {children}
    </ModalContext.Provider>
  );
};

export default ModalProvider;
