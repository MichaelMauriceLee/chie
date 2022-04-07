import React from 'react';

interface ImageDisplayControlsProps {
  showLineBoundingBox: boolean;
  showWordBoundingBox: boolean;
  setShowLineBoundingBox: (params: boolean) => void;
  setShowWordBoundingBox: (params: boolean) => void;
  setFile: (params: File | null) => void;
  setImage: (params: string | null) => void;
}

const ImageDisplayControls: React.FC<ImageDisplayControlsProps> = ({
  showLineBoundingBox,
  showWordBoundingBox,
  setShowLineBoundingBox,
  setShowWordBoundingBox,
  setImage,
  setFile,
}) => {
  const toggleShowLineBoundingBox = () => {
    setShowLineBoundingBox(!showLineBoundingBox);
  };

  const toggleShowWordBoundingBox = () => {
    setShowWordBoundingBox(!showWordBoundingBox);
  };

  const clearImage = () => {
    setImage(null);
    setFile(null);
  };

  return (
    <div className="flex flex-row justify-between items-start space-x-4 pt-1">
      <div>
        <div>
          Position the mouse cursor over the image and use the scroll wheel to zoom in.
        </div>
        <div>
          Hold left click + drag to pan.
        </div>
        <div>
          Hold down left ctrl + left click to select and search words.
        </div>
      </div>

      <div className="flex flex-row items-center space-x-4">
        <div className="space-y-1">
          <div className="space-x-1">
            <input
              className="rounded focus:outline-none focus:ring focus:border-blue-500"
              type="checkbox"
              id="showLineBoxes"
              defaultChecked={showLineBoundingBox}
              onChange={toggleShowLineBoundingBox}
            />
            <label htmlFor="showLineBoxes">Lines</label>
          </div>
          <div className="space-x-1">
            <input
              className="rounded focus:outline-none focus:ring focus:border-blue-500"
              type="checkbox"
              id="showWordBoxes"
              defaultChecked={showWordBoundingBox}
              onChange={toggleShowWordBoundingBox}
            />
            <label htmlFor="showWordBoxes">Words</label>
          </div>
        </div>

        <div>
          <button
            className="border border-black rounded md:py-2 md:px-4 py-1 px-2 hover:bg-blue-500 hover:border-blue-500 hover:text-white
            focus:outline-none focus:ring focus:border-blue-500"
            type="button"
            onClick={clearImage}
          >
            Clear
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImageDisplayControls;
