import React, { useState } from 'react';
import DropArea from './DropArea';
import ImageDisplay from './ImageDisplay';
import ImageDisplayControls from './ImageDisplayControls';

interface ImageAreaProps {
  image: File | null;
  setImage: (params: File | null) => void;
  setKeyword: (params: string) => void;
}

const ImageArea: React.FC<ImageAreaProps> = ({ image, setImage, setKeyword }) => {
  const [showLineBoundingBox, setShowLineBoundingBox] = useState<boolean>(true);
  const [showWordBoundingBox, setShowWordBoundingBox] = useState<boolean>(false);

  return (
    <div className="mt-2">
      {image ? (
        <>
          <ImageDisplay
            image={image}
            setKeyword={setKeyword}
            showLineBoundingBox={showLineBoundingBox}
            showWordBoundingBox={showWordBoundingBox}
          />
          <ImageDisplayControls
            showLineBoundingBox={showLineBoundingBox}
            setShowLineBoundingBox={setShowLineBoundingBox}
            showWordBoundingBox={showWordBoundingBox}
            setShowWordBoundingBox={setShowWordBoundingBox}
            setImage={setImage}
          />
        </>
      ) : (
        <DropArea setImage={setImage} />
      )}
    </div>
  );
};

export default ImageArea;
