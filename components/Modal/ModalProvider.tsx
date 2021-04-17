import React, { createContext, useState } from 'react';
import Modal from './Modal';

const [showModal, setShowModal] = useState(false);

const toggleModal = () => {
  setShowModal((prev) => !prev);
};

export const ModalContext = createContext<() => void>(toggleModal);

const ModalProvider: React.FC = ({ children }) => (
  <ModalContext.Provider value={toggleModal}>
    {showModal && <Modal showModal={showModal} toggleModal={toggleModal} />}

    {children}
  </ModalContext.Provider>
);

export default ModalProvider;
