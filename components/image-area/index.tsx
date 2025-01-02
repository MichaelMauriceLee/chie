import React, { useState } from "react";
import DropArea from "./drop-area";
import ImageCropper from "./image-cropper";
import ImageDisplay from "./image-display";

type Props = {
  setKeyword: (params: string) => void;
};

export default function ImageArea({ setKeyword }: Readonly<Props>) {
  const [file, setFile] = useState<File | null>(null);
  const [image, setImage] = useState<string | null>(null);

  return (
    <div className="w-full">
      {file ? (
        image ? (
          <ImageDisplay
            image={image}
            setKeyword={setKeyword}
            setFile={setFile}
            setImage={setImage}
          />
        ) : (
          <ImageCropper file={file} setFile={setFile} setImage={setImage} />
        )
      ) : (
        <DropArea setFile={setFile} />
      )}
    </div>
  );
}
