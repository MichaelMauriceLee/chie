import React, { useState } from 'react';
import DropArea from './DropArea';
import { ImageModule } from './ImageModule';

const ImageArea: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);

  return (
    <div className="mt-2">
      {file ? (
        <ImageModule
          file={file}
          setFile={setFile}
        />
      ) : (
        <DropArea setFile={setFile} />
      )}
    </div>
  );
};

export default ImageArea;
