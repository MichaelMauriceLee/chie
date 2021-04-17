import { useContext } from 'react';
import { ModalContext } from '../components/Modal/ModalProvider';

const useModal = (): () => void => useContext(ModalContext);

export default useModal;
