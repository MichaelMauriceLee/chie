import React, { useEffect, useRef, useState } from "react";
import { Cropper, ReactCropperElement } from "react-cropper";
import { Button } from "../ui/button";
import { useTranslations } from "next-intl";

type Props = {
  file: File | null;
  setFile: React.Dispatch<React.SetStateAction<File | null>>;
  setImage: React.Dispatch<React.SetStateAction<string | null>>;
};

export default function ImageCropper({
  file,
  setFile,
  setImage,
}: Readonly<Props>) {
  const t = useTranslations("ImageCropper");

  const cropperRef = useRef<ReactCropperElement>(null);
  const [rawImage, setRawImage] = useState<string>();

  useEffect(() => {
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setRawImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  }, [file]);

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
          src={rawImage}
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
          <div>{t("instructions")}</div>
        </div>

        <div className="flex flex-row items-center space-x-4">
          <Button onClick={clear}>{t("clearButton")}</Button>
          <Button onClick={setCroppedImage}>{t("cropButton")}</Button>
        </div>
      </div>
    </>
  );
}
