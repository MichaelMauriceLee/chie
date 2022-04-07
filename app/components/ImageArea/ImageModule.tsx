import React, { useState } from 'react';
import ImageCropper from './ImageCropper';
import ImageCropperControls from './ImageCropperControls';
import ImageDisplay from './ImageDisplay';
import ImageDisplayControls from './ImageDisplayControls';

interface ImageModuleProps {
  file: File | null;
  setFile: (params: File | null) => void;
  setKeyword: (params: string) => void;
}

export const ImageModule: React.FC<ImageModuleProps> = ({ file, setFile, setKeyword }) => {
  const [croppedImage, setCroppedImage] = useState<string | null>(null);
  const [showLineBoundingBox, setShowLineBoundingBox] = useState<boolean>(true);
  const [showWordBoundingBox, setShowWordBoundingBox] = useState<boolean>(false);
  const [cropper, setCropper] = useState<any>();

  return (
    <>
      {croppedImage ? (
        <>
          <ImageDisplay
            image={croppedImage}
            showLineBoundingBox={showLineBoundingBox}
            showWordBoundingBox={showWordBoundingBox}
            setKeyword={setKeyword}
          />
          <ImageDisplayControls
            showLineBoundingBox={showLineBoundingBox}
            showWordBoundingBox={showWordBoundingBox}
            setShowWordBoundingBox={setShowWordBoundingBox}
            setShowLineBoundingBox={setShowLineBoundingBox}
            setImage={setCroppedImage}
            setFile={setFile}
          />
        </>
      ) : (
        <>
          <ImageCropper
            setCropper={setCropper}
            file={file}
          />
          <ImageCropperControls
            cropper={cropper}
            setImage={setCroppedImage}
            setFile={setFile}
          />
        </>
      )}
    </>
  );
};

export default ImageModule;
