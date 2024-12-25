import React, { useCallback, useEffect, useRef, useState } from "react";
import { Cropper, ReactCropperElement } from "react-cropper";
import { Button } from "../ui/button";

type ImageCropperProps = {
  file: File | null;
  setFile: (params: File | null) => void;
  setImage: (params: string | null) => void;
};

export default function ImageCropper({
  file,
  setFile,
  setImage,
}: ImageCropperProps) {
  const cropperRef = useRef<ReactCropperElement>(null);
  const [unCroppedImage, setUncroppedImage] = useState<string>();

  const getDataURL = useCallback(() => {
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setUncroppedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  }, [file]);

  useEffect(() => {
    getDataURL();
  }, [getDataURL]);

  function setCroppedImage() {
    const cropper = cropperRef.current?.cropper;
    if (cropper) {
      setImage(cropper.getCroppedCanvas().toDataURL());
    }
  }

  function clear() {
    setImage(null);
    setFile(null);
  }

  return (
    <>
      <div className="h-96 w-full relative">
        <Cropper
          style={{ height: 400, width: "100%" }}
          initialAspectRatio={1}
          src={unCroppedImage}
          viewMode={1}
          minCropBoxHeight={10}
          minCropBoxWidth={10}
          background={false}
          responsive
          autoCropArea={1}
          checkOrientation={false}
          guides={false}
          ref={cropperRef}
        />
      </div>

      <div className="flex flex-row justify-between items-start space-x-4 pt-5">
        <div>
          <div>
            Position the window and then hit the button to crop the image and
            begin analysis.
          </div>
        </div>

        <div className="flex flex-row items-center space-x-4">
          <Button onClick={clear}>Clear</Button>
          <Button onClick={setCroppedImage}>Crop Image</Button>
        </div>
      </div>
    </>
  );
}
