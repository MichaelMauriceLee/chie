import React, { useState } from 'react';
import DropArea from './DropArea';
import { ImageModule } from './ImageModule';

interface ImageAreaProps {
  setKeyword: (params: string) => void;
}

const ImageArea: React.FC<ImageAreaProps> = ({ setKeyword }) => {
  const [file, setFile] = useState<File | null>(null);

  return (
    <div className="mt-2">
      {file ? (
        <ImageModule
          file={file}
          setFile={setFile}
          setKeyword={setKeyword}
        />
      ) : (
        <DropArea setFile={setFile} />
      )}
    </div>
  );
};

export default ImageArea;
