import React from 'react';

interface ImageCropperControlsProps {
  cropper: any
  setFile: (params: File | null) => void;
  setImage: (params: string | null) => void;
}

// eslint-disable-next-line max-len
const ImageCropperControls: React.FC<ImageCropperControlsProps> = ({ cropper, setImage, setFile }) => {
  const setCroppedImage = () => {
    if (typeof cropper !== 'undefined') {
      setImage(cropper.getCroppedCanvas().toDataURL());
    }
  };

  const clear = () => {
    setImage(null);
    setFile(null);
  };

  return (
    <div className="flex flex-row justify-between items-start space-x-4 pt-5">
      <div>
        <div>
          Position the window and then hit the button to crop the image and begin analysis.
        </div>
      </div>

      <div className="flex flex-row items-center space-x-4">
        <button
          className="border border-black rounded md:py-2 md:px-4 py-1 px-2 hover:bg-blue-500 hover:border-blue-500 hover:text-white
            focus:outline-none focus:ring focus:border-blue-500"
          type="button"
          onClick={clear}
        >
          Clear
        </button>

        <button
          className="border border-black rounded md:py-2 md:px-4 py-1 px-2 hover:bg-blue-500 hover:border-blue-500 hover:text-white
            focus:outline-none focus:ring focus:border-blue-500"
          type="button"
          onClick={setCroppedImage}
        >
          Crop Image
        </button>
      </div>
    </div>
  );
};

export default ImageCropperControls;
