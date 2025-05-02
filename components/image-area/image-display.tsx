"use client";

import React, { useEffect } from "react";
import { Button } from "../ui/button";
import { Checkbox } from "../ui/checkbox";
import { Label } from "../ui/label";
import LoadingIndicator from "./loading-indicator";
import { useAtom } from "jotai";
import { wordSelectionModeAtom } from "@/store/atoms";
import { useTranslations } from "next-intl";
import { useCanvasSetup } from "@/hooks/useCanvasSetup";
import { useOCRAnalysis } from "@/hooks/useOCRAnalysis";
import { useOCRRendering } from "@/hooks/useOCRRendering";
import { useOCRInteraction } from "@/hooks/useOCRInteraction";

type Props = {
  image: string;
  setKeyword: React.Dispatch<React.SetStateAction<string>>;
  setFile: React.Dispatch<React.SetStateAction<File | null>>;
  setImage: React.Dispatch<React.SetStateAction<string | null>>;
};

export default function ImageDisplay({
  image,
  setKeyword,
  setFile,
  setImage,
}: Readonly<Props>) {
  const t = useTranslations("ImageDisplay");
  const [wordSelectionMode] = useAtom(wordSelectionModeAtom);

  const { canvasRef, canvasWrapperRef, imgRef, isCanvasVisible } =
    useCanvasSetup(image);
  const { isLoading, imageSearchResult } = useOCRAnalysis(image);

  const canvas = canvasRef.current;
  const ctx = canvas?.getContext("2d") ?? null;

  const [showLineBoundingBox, setShowLineBoundingBox] = React.useState(true);
  const [showWordBoundingBox, setShowWordBoundingBox] = React.useState(false);

  const { drawImageAndBoundingBoxes, translateImagePoint } = useOCRRendering(
    ctx,
    canvas,
    imgRef.current,
    imageSearchResult,
    showLineBoundingBox,
    showWordBoundingBox
  );

  const { onMouseDown, onMouseMove, onMouseUp, onWheel, cursorStyle } =
    useOCRInteraction(
      canvas,
      ctx,
      imageSearchResult,
      translateImagePoint,
      setKeyword,
      wordSelectionMode,
      drawImageAndBoundingBoxes
    );

  useEffect(() => {
    if (!canvas) return;
    canvas.addEventListener("wheel", onWheel);
    return () => {
      canvas.removeEventListener("wheel", onWheel);
    };
  }, [canvas, onWheel]);

  useEffect(() => {
    window.requestAnimationFrame(drawImageAndBoundingBoxes);
  }, [
    drawImageAndBoundingBoxes,
    showLineBoundingBox,
    showWordBoundingBox,
    imageSearchResult,
  ]);

  const clearImage = () => {
    setImage(null);
    setFile(null);
  };

  return (
    <>
      <div className="h-96 w-full relative" ref={canvasWrapperRef}>
        {isLoading && <LoadingIndicator />}
        <canvas
          className={`${isCanvasVisible ? "border border-black" : ""}`}
          style={{ cursor: cursorStyle }}
          ref={canvasRef}
          onMouseDown={onMouseDown}
          onMouseUp={onMouseUp}
          onMouseMove={onMouseMove}
        />
      </div>

      <div className="flex flex-row justify-between items-start space-x-4 pt-1">
        <div>
          <div>{t("instructions.zoom")}</div>
          <div>{t("instructions.pan")}</div>
          <div>{t("instructions.select")}</div>
        </div>

        <div className="flex flex-row items-center space-x-4">
          <div className="space-y-2">
            <div className="flex items-center space-x-1">
              <Checkbox
                checked={showLineBoundingBox}
                onCheckedChange={(checked) =>
                  setShowLineBoundingBox(Boolean(checked))
                }
              />
              <Label htmlFor="showLineBoxes">{t("options.lines")}</Label>
            </div>
            <div className="flex items-center space-x-1">
              <Checkbox
                checked={showWordBoundingBox}
                onCheckedChange={(checked) =>
                  setShowWordBoundingBox(Boolean(checked))
                }
              />
              <Label htmlFor="showWordBoxes">{t("options.words")}</Label>
            </div>
          </div>

          <Button onClick={clearImage}>{t("buttons.clear")}</Button>
        </div>
      </div>
    </>
  );
}
