"use client";

import React from "react";
import {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
} from "@/components/ui/context-menu";
import { Upload, ClipboardPaste } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { useDropHandlers } from "@/hooks/useDropHandlers";

type Props = {
  setFile: React.Dispatch<React.SetStateAction<File | null>>;
};

export default function DropArea({ setFile }: Readonly<Props>) {
  const t = useTranslations("DropArea");

  const {
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
  } = useDropHandlers(setFile);

  return (
    <ContextMenu>
      <ContextMenuTrigger>
        <button
          type="button"
          onPaste={onPhotoPaste}
          onDragEnter={onDragEnter}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          onClick={onClick}
          className={cn(
            "flex flex-col items-center justify-center border-2 border-dotted h-96 w-full transition-colors duration-300",
            isDragging
              ? "bg-gray-200 text-gray-900 dark:bg-gray-600 dark:text-gray-400"
              : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300",
            "hover:bg-gray-200 dark:hover:bg-gray-600 dark:hover:text-gray-400"
          )}
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
        </button>
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
