"use client";

import React, { useRef, useState } from "react";
import {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
} from "@/components/ui/context-menu";
import { Upload, ClipboardPaste } from "lucide-react";
import { useTranslations } from "next-intl";

type DropAreaProps = {
  setFile: (param: File | null) => void;
};

export default function DropArea({ setFile }: DropAreaProps) {
  const t = useTranslations("Home");

  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function onClick() {
    const inputRef = fileInputRef?.current;
    if (inputRef) {
      inputRef.click();
    }
  }

  function onPhotoPaste(evt: React.ClipboardEvent<HTMLDivElement>) {
    const files = evt.clipboardData?.files;
    if (files && files.length !== 0) {
      setFile(files[0]);
    }
  }

  function onDragEnter(evt: React.DragEvent<HTMLDivElement>) {
    evt.preventDefault();
    setIsDragging(true);
  }

  function onDragOver(evt: React.DragEvent<HTMLDivElement>) {
    evt.preventDefault();
  }

  function onDragLeave() {
    setIsDragging(false);
  }

  function onDrop(evt: React.DragEvent<HTMLDivElement>) {
    evt.preventDefault();
    setIsDragging(false);

    if (evt.dataTransfer.files.length !== 0) {
      setFile(evt.dataTransfer.files[0]);
    }
  }

  function onPhotoUpload() {
    if (fileInputRef.current) {
      const { files } = fileInputRef.current;
      if (files && files.length !== 0) {
        setFile(files[0]);
      }
    }
  }

  async function pasteFromClipboard() {
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
      console.error("Failed to paste image from clipboard:", error);
    }
  }

  return (
    <ContextMenu>
      <ContextMenuTrigger>
        <div
          className={`flex flex-col items-center justify-center border-2 border-dotted h-96 w-full cursor-pointer hover:bg-blue-500 hover:text-white ${
            isDragging ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-700"
          }`}
          onPaste={onPhotoPaste}
          onDragEnter={onDragEnter}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          onClick={onClick}
          role="button"
          tabIndex={0}
        >
          <Upload className="w-10 h-10 mb-2" />
          <span className="text-lg">Drag and drop an image here</span>
          <span className="text-sm">or click to upload</span>
          <span className="text-sm">or press Ctrl + V to paste</span>
          <input
            className="hidden"
            ref={fileInputRef}
            type="file"
            name="image"
            accept="image/*"
            onChange={onPhotoUpload}
          />
        </div>
      </ContextMenuTrigger>

      <ContextMenuContent>
        <ContextMenuItem onClick={pasteFromClipboard}>
          <ClipboardPaste className="w-5 h-5 mr-2" />
          {t("paste-image-from-clipboard")}
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}
