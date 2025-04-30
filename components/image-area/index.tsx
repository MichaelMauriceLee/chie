import React, { useState } from "react";
import DropArea from "./drop-area";
import ImageCropper from "./image-cropper";
import ImageDisplay from "./image-display";

type Props = {
  setKeyword: React.Dispatch<React.SetStateAction<string>>;
};

export default function ImageArea({ setKeyword }: Readonly<Props>) {
  const [file, setFile] = useState<File | null>(null);
  const [image, setImage] = useState<string | null>(null);

  let content;
  if (!file) {
    content = <DropArea setFile={setFile} />;
  } else if (!image) {
    content = (
      <ImageCropper file={file} setFile={setFile} setImage={setImage} />
    );
  } else {
    content = (
      <ImageDisplay
        image={image}
        setKeyword={setKeyword}
        setFile={setFile}
        setImage={setImage}
      />
    );
  }

  return <div className="w-full">{content}</div>;
}
