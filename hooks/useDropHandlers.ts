import { useRef, useState } from "react";

export function useDropHandlers(
  setFile: React.Dispatch<React.SetStateAction<File | null>>
) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const onClick = () => {
    fileInputRef.current?.click();
  };

  const onPhotoPaste = (evt: React.ClipboardEvent<HTMLButtonElement>) => {
    const files = evt.clipboardData?.files;
    if (files && files.length !== 0) {
      setFile(files[0]);
    }
  };

  const onDragEnter = (evt: React.DragEvent<HTMLButtonElement>) => {
    evt.preventDefault();
    setIsDragging(true);
  };

  const onDragOver = (evt: React.DragEvent<HTMLButtonElement>) => {
    evt.preventDefault();
  };

  const onDragLeave = () => {
    setIsDragging(false);
  };

  const onDrop = (evt: React.DragEvent<HTMLButtonElement>) => {
    evt.preventDefault();
    setIsDragging(false);
    if (evt.dataTransfer.files.length !== 0) {
      setFile(evt.dataTransfer.files[0]);
    }
  };

  const onPhotoUpload = () => {
    const files = fileInputRef.current?.files;
    if (files && files.length !== 0) {
      setFile(files[0]);
    }
  };

  const pasteFromClipboard = async () => {
    try {
      const clipboardItems = await navigator.clipboard.read();
      if (
        clipboardItems.length !== 0 &&
        clipboardItems[0].types.includes("image/png")
      ) {
        const clipboardItem = clipboardItems[0];
        const blob = await clipboardItem.getType("image/png");
        setFile(blob as File);
      }
    } catch (error) {
      console.error("Paste from clipboard failed:", error);
    }
  };

  return {
    isDragging,
    fileInputRef,
    onClick,
    onPhotoPaste,
    onDragEnter,
    onDragOver,
    onDragLeave,
    onDrop,
    onPhotoUpload,
    pasteFromClipboard,
  };
}
