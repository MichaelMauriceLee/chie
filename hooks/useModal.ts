import { useContext } from 'react';
import { ModalContext } from '../components/Provider/ModalProvider';

const useModal = (): () => void => useContext(ModalContext);

export default useModal;
