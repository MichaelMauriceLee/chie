import React from 'react';

interface ButtonRowProps {
  isConnectedToAnki: boolean;
  save: () => void;
  toggleModal: () => void;
}

const ButtonRow: React.FC<ButtonRowProps> = ({ isConnectedToAnki, save, toggleModal }) => (
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
      onClick={toggleModal}
    >
      Cancel
    </button>
  </div>
);

export default ButtonRow;
