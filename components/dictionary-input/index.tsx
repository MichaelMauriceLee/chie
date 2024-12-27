"use client";

import { X, Upload, Send, Loader } from "lucide-react";
import ImageArea from "../image-area";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import { Textarea } from "../ui/textarea";
import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

type DictionaryInputProps = {
  initialText: string;
  i18n: {
    askAQuestionPlaceholder: string;
  };
};

export default function DictionaryInput({
  initialText,
  i18n,
}: DictionaryInputProps) {
  const [text, setText] = useState(decodeURIComponent(initialText));
  const [showImageArea, setShowImageArea] = useState(false);
  const [isPending, startTransition] = useTransition();

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const router = useRouter();

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleQuerySubmit();
    }
  }

  function handleChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setText(e.target.value);

    if (textareaRef.current) {
      const el = textareaRef.current;
      el.style.height = "auto";
      el.style.height = `${el.scrollHeight}px`;
    }
  }

  function handleQuerySubmit() {
    if (text.trim()) {
      startTransition(() => {
        const params = new URLSearchParams(window.location.search);
        params.set("query", encodeURIComponent(text));
        router.push(`?${params.toString()}`);
      });
    }
  }

  return (
    <Card className="w-full">
      <CardContent>
        <div className="relative my-3">
          <Textarea
            ref={textareaRef}
            value={text}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            rows={1}
            placeholder={i18n.askAQuestionPlaceholder}
            className="
                w-full 
                pr-10 
                resize-none 
                overflow-y-auto 
                max-h-[10rem] 
                scrollbar-thin 
                scrollbar-thumb-rounded 
                scrollbar-thumb-gray-300 
                hover:scrollbar-thumb-gray-400
            "
          />
          {text && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-4 top-1/2 -translate-y-1/2"
              onClick={() => setText("")}
            >
              <X size={16} />
            </Button>
          )}
        </div>

        <div className="flex items-center justify-between mb-3">
          <Button
            onClick={() => setShowImageArea(!showImageArea)}
          >
            <Upload />
          </Button>

          <Button
            onClick={handleQuerySubmit}
            disabled={isPending}
          >
            {isPending ? <Loader className="animate-spin" /> : <Send />}
          </Button>
        </div>

        {showImageArea && <ImageArea setKeyword={setText} />}
      </CardContent>
    </Card>
  );
}
