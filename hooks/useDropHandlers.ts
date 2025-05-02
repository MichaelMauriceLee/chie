import { useCallback, useRef, useState } from "react";

export function useDropHandlers(
  setFile: React.Dispatch<React.SetStateAction<File | null>>
) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const onClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const onPhotoPaste = useCallback(
    (evt: React.ClipboardEvent<HTMLButtonElement>) => {
      const files = evt.clipboardData?.files;
      if (files && files.length !== 0) {
        setFile(files[0]);
      }
    },
    [setFile]
  );

  const onDragEnter = useCallback((evt: React.DragEvent<HTMLButtonElement>) => {
    evt.preventDefault();
    setIsDragging(true);
  }, []);

  const onDragOver = useCallback((evt: React.DragEvent<HTMLButtonElement>) => {
    evt.preventDefault();
  }, []);

  const onDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const onDrop = useCallback(
    (evt: React.DragEvent<HTMLButtonElement>) => {
      evt.preventDefault();
      setIsDragging(false);
      if (evt.dataTransfer.files.length !== 0) {
        setFile(evt.dataTransfer.files[0]);
      }
    },
    [setFile]
  );

  const onPhotoUpload = useCallback(() => {
    const files = fileInputRef.current?.files;
    if (files && files.length !== 0) {
      setFile(files[0]);
    }
  }, [setFile]);

  const pasteFromClipboard = useCallback(async () => {
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
  }, [setFile]);

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
