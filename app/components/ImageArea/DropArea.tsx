import React, { useRef, useState } from 'react';
import DropAreaContextMenu from './DropAreaContextMenu';

import isMobile from '../../utils/isMobile';

interface DropAreaProps {
  setFile: (param: File | null) => void
}

const DropArea:React.FC<DropAreaProps> = ({ setFile }) => {
  const [isHovering, setIsHovering] = useState<boolean>();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const clickHiddenPhotoUploadBtn = () => {
    const inputRef = fileInputRef?.current;
    if (inputRef) {
      inputRef.click();
    }
  };

  const onClick = () => {
    if (isMobile) {
      clickHiddenPhotoUploadBtn();
    }
  };

  const onDoubleClick = () => {
    if (!isMobile) {
      clickHiddenPhotoUploadBtn();
    }
  };

  const onPhotoPaste = (evt: React.ClipboardEvent<HTMLDivElement>) => {
    // @ts-expect-error window is defined
    const { files } = evt.clipboardData || window.clipboardData;
    if (files.length !== 0) {
      setFile(files[0]);
    }
  };

  const onDragEnter = (evt: React.DragEvent<HTMLDivElement>) => {
    evt.preventDefault();
    setIsHovering(true);
  };

  const onDragLeave = () => {
    if (isHovering) {
      setIsHovering(false);
    }
  };

  const onDrop = (evt: React.DragEvent<HTMLDivElement>) => {
    evt.preventDefault();
    if (evt.dataTransfer.files.length !== 0) {
      setFile(evt.dataTransfer.files[0]);
    }
  };

  const onPhotoUpload = () => {
    if (fileInputRef.current) {
      const { files } = fileInputRef.current;
      if (files && files.length !== 0) {
        setFile(files[0]);
      }
    }
  };

  return (
    <div>
      <DropAreaContextMenu setFile={setFile} />
      <div
        className={`flex flex-row items-center justify-center my-2 border-2 rounded-md border-dotted h-96 w-full ${isHovering ? 'bg-blue-500 text-white cursor-pointer' : ''}
      hover:bg-blue-500 hover:text-white rounded focus:outline-none focus:ring focus:border-blue-500 focus:bg-blue-500 focus:text-white cursor-pointer `}
        onPaste={onPhotoPaste}
        onDragEnter={onDragEnter}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        role="button"
        tabIndex={0}
        onClick={onClick}
        onDoubleClick={onDoubleClick}
        onKeyPress={clickHiddenPhotoUploadBtn}
      >
        <div className="flex flex-col items-center justify-center pointer-events-none">
          <div className="flex flex-row items-center pointer-events-none">
            <svg
              className="w-8 h-8 mr-2 pointer-events-none"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                className="pointer-events-none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
            Upload image
          </div>

          {!isMobile && <div className="pointer-events-none">Double click to select a file</div>}

          {!isMobile && <div className="pointer-events-none">OR drag and drop an image here</div>}

          {!isMobile && (
          <div className="pointer-events-none">
            OR hit Alt + PrintScreen to take a screenshot
            and then click here and hit Ctrl + V to upload
          </div>
          )}
        </div>

        <input
          className="hidden"
          ref={fileInputRef}
          type="file"
          name="image"
          accept="image/*"
          onChange={onPhotoUpload}
        />
      </div>
    </div>

  );
};

export default DropArea;
