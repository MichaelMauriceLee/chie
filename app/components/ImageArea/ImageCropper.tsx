import React, { useEffect, useState } from 'react';
import { Cropper } from 'react-cropper';

interface ImageCropperProps {
  setCropper: (params: unknown) => void
  file: File | null
}

const ImageCropper: React.FC<ImageCropperProps> = ({
  setCropper, file,
}) => {
  const [unCroppedImage, setUncroppedImage] = useState<string>();

  const getDataURL = () => {
    const reader = new FileReader();
    reader.onload = () => {
      setUncroppedImage(reader.result as string);
    };
    reader.readAsDataURL(file as File);
  };

  useEffect(() => {
    getDataURL();
  }, []);

  return (
    <div className="h-96 w-full relative">
      <Cropper
        style={{ height: 400, width: '100%' }}
        initialAspectRatio={1}
        src={unCroppedImage}
        viewMode={1}
        minCropBoxHeight={10}
        minCropBoxWidth={10}
        background={false}
        responsive
        autoCropArea={1}
        checkOrientation={false}
        onInitialized={(instance) => {
          setCropper(instance);
        }}
        guides={false}
      />
    </div>
  );
};

export default ImageCropper;
