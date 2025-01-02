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

type Props = {
  setFile: (param: File | null) => void;
};

export default function DropArea({ setFile }: Readonly<Props>) {
  const t = useTranslations("DropArea");

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
      console.error(t("error.paste-failed"), error);
    }
  }

  return (
    <ContextMenu>
      <ContextMenuTrigger>
        <div
          className={`
            flex flex-col items-center justify-center border-2 border-dotted h-96 w-full cursor-pointer transition-colors duration-300 
            ${
              isDragging
                ? "bg-gray-200 text-gray-900"
                : "bg-gray-100 text-gray-800"
            }
            hover:bg-gray-200
            ${
              isDragging
                ? "dark:bg-gray-600  dark:text-gray-400"
                : "dark:bg-gray-700  dark:text-gray-300"
            }
          dark:hover:bg-gray-600 dark:hover:text-gray-400`}
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
          <span className="text-lg">{t("drag-drop")}</span>
          <span className="text-sm">{t("click-upload")}</span>
          <span className="text-sm">{t("ctrl-v")}</span>
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

      <ContextMenuContent className="bg-white text-gray-900 dark:bg-gray-800 dark:text-gray-200 shadow-md rounded-lg p-2">
        <ContextMenuItem
          onClick={pasteFromClipboard}
          className="hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors rounded-md px-2 py-1"
        >
          <ClipboardPaste className="w-5 h-5 mr-2" />
          {t("paste-from-clipboard")}
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}
