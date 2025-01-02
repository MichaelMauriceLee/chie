"use client";

import React, {
  useEffect,
  useRef,
  useState,
  useCallback,
  useMemo,
} from "react";
import LoadingIndicator from "./loading-indicator";
import { Button } from "../ui/button";
import { Checkbox } from "../ui/checkbox";
import { Label } from "../ui/label";
import { OCRBlock, OCRCoordinate, OCRWord } from "@/models/serverActions";
import { analyzeImage } from "@/app/[locale]/actions";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

type Props = {
  image: string;
  setKeyword: (params: string) => void;
  setFile: (params: File | null) => void;
  setImage: (params: string | null) => void;
};

function pointInPolygon(
  polygon: OCRCoordinate[],
  testPoint: OCRCoordinate
): boolean {
  let inside = false;

  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i].x;
    const yi = polygon[i].y;
    const xj = polygon[j].x;
    const yj = polygon[j].y;

    const intersects =
      yi > testPoint.y !== yj > testPoint.y &&
      testPoint.x < ((xj - xi) * (testPoint.y - yi)) / (yj - yi) + xi;

    if (intersects) {
      inside = !inside;
    }
  }

  return inside;
}

export default function ImageDisplay({
  image,
  setKeyword,
  setFile,
  setImage,
}: Readonly<Props>) {
  const t = useTranslations("ImageDisplay");

  const canvasWrapperRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement>(new Image());
  const tempWordArrayRef = useRef<OCRWord[]>([]);

  const [imageSearchResult, setImageSearchResult] = useState<OCRBlock[] | null>(
    null
  );
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [isCanvasVisible, setIsCanvasVisible] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStartPosition, setDragStartPosition] =
    useState<OCRCoordinate | null>(null);

  const [showLineBoundingBox, setShowLineBoundingBox] = useState<boolean>(true);
  const [showWordBoundingBox, setShowWordBoundingBox] =
    useState<boolean>(false);

  const canvasWrapper = canvasWrapperRef.current;
  const canvas = canvasRef.current;
  const ctx = useMemo(() => canvas?.getContext("2d") ?? null, [canvas]);

  const fetchAnalysis = useCallback(async () => {
    setIsLoading(true);
    setImageSearchResult(null);

    try {
      const data = await analyzeImage(image);
      setImageSearchResult(data.readResult.blocks);
    } catch (err: unknown) {
      const resolvedError =
        err instanceof Error ? err : new Error("Unknown error occurred.");
      toast.error(`${t("error.message")}: ${resolvedError.message}`, {
        position: "top-center",
      });
      console.error(resolvedError);
    } finally {
      setIsLoading(false);
    }
  }, [image, t]);

  useEffect(() => {
    if (image) {
      void fetchAnalysis();
    }
  }, [image, fetchAnalysis]);

  const transformMousePoint = useCallback(
    (x: number, y: number) => {
      if (!ctx) return { x: 0, y: 0 };
      const transform = ctx.getTransform();
      const inverseZoom = 1 / transform.a;

      const transformedX = inverseZoom * x - inverseZoom * transform.e;
      const transformedY = inverseZoom * y - inverseZoom * transform.f;
      return { x: transformedX, y: transformedY };
    },
    [ctx]
  );

  const getMousePos = useCallback(
    (
      evt:
        | React.WheelEvent<HTMLCanvasElement>
        | React.MouseEvent<HTMLCanvasElement>
        | WheelEvent
    ) => {
      if (!canvas) return null;
      const rect = canvas.getBoundingClientRect();

      const mousePos = {
        x:
          ((evt.clientX - rect.left) / (rect.right - rect.left)) * canvas.width,
        y:
          ((evt.clientY - rect.top) / (rect.bottom - rect.top)) * canvas.height,
      };

      return transformMousePoint(mousePos.x, mousePos.y);
    },
    [canvas, transformMousePoint]
  );

  const getImageTransformationParameters = useCallback(() => {
    if (!canvas || !imgRef.current.width || !imgRef.current.height) {
      return { ratio: 1, centerShiftX: 0, centerShiftY: 0 };
    }
    const hRatio = canvas.width / imgRef.current.width;
    const vRatio = canvas.height / imgRef.current.height;
    const ratio = Math.min(hRatio, vRatio);
    const centerShiftX = (canvas.width - imgRef.current.width * ratio) / 2;
    const centerShiftY = (canvas.height - imgRef.current.height * ratio) / 2;
    return {
      ratio,
      centerShiftX,
      centerShiftY,
    };
  }, [canvas]);

  const translateImagePoint = useCallback(
    (point: OCRCoordinate): [number, number] => {
      const { ratio, centerShiftX, centerShiftY } =
        getImageTransformationParameters();
      return [point.x * ratio + centerShiftX, point.y * ratio + centerShiftY];
    },
    [getImageTransformationParameters]
  );

  const clearCanvas = useCallback(() => {
    if (ctx && canvas) {
      ctx.save();
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.restore();
    }
  }, [canvas, ctx]);

  const drawPolygon = useCallback(
    (polygon: OCRCoordinate[], strokeColor: string) => {
      if (!ctx || polygon.length < 1) return;

      ctx.beginPath();
      const [startX, startY] = translateImagePoint(polygon[0]);
      ctx.moveTo(startX, startY);

      for (let i = 1; i < polygon.length; i++) {
        const [x, y] = translateImagePoint(polygon[i]);
        ctx.lineTo(x, y);
      }
      ctx.lineTo(startX, startY);

      ctx.strokeStyle = strokeColor;
      ctx.stroke();
    },
    [ctx, translateImagePoint]
  );

  const drawImageAndBoundingBoxes = useCallback(() => {
    if (!image || !ctx || !canvas) return;

    clearCanvas();

    const { ratio, centerShiftX, centerShiftY } =
      getImageTransformationParameters();

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(
      imgRef.current,
      0,
      0,
      imgRef.current.width,
      imgRef.current.height,
      centerShiftX,
      centerShiftY,
      imgRef.current.width * ratio,
      imgRef.current.height * ratio
    );

    if (imageSearchResult) {
      imageSearchResult.forEach((block) => {
        block.lines.forEach((line) => {
          if (showLineBoundingBox) {
            drawPolygon(line.boundingPolygon, "#0066ff");
          }
          line.words.forEach((word) => {
            if (showWordBoundingBox) {
              drawPolygon(word.boundingPolygon, "#830d30");
            }
          });
        });
      });
    }
  }, [
    image,
    ctx,
    canvas,
    clearCanvas,
    getImageTransformationParameters,
    imageSearchResult,
    drawPolygon,
    showLineBoundingBox,
    showWordBoundingBox,
  ]);

  useEffect(() => {
    window.requestAnimationFrame(drawImageAndBoundingBoxes);
  }, [
    drawImageAndBoundingBoxes,
    imageSearchResult,
    showLineBoundingBox,
    showWordBoundingBox,
  ]);

  useEffect(() => {
    if (canvas && canvasWrapper) {
      canvas.height = canvasWrapper.getBoundingClientRect().height;
      canvas.width = canvasWrapper.getBoundingClientRect().width;
      imgRef.current.onload = drawImageAndBoundingBoxes;
      imgRef.current.src = image;
      setIsCanvasVisible(true);
    }
  }, [canvas, canvasWrapper, drawImageAndBoundingBoxes, image]);

  const onWheel = useCallback(
    (evt: WheelEvent) => {
      evt.preventDefault();
      const mousePos = getMousePos(evt);
      if (mousePos && ctx) {
        const zoom = evt.deltaY < 0 ? 1.1 : 0.9;
        const { x, y } = mousePos;
        ctx.translate(x, y);
        ctx.scale(zoom, zoom);
        ctx.translate(-x, -y);

        window.requestAnimationFrame(drawImageAndBoundingBoxes);
      }
    },
    [ctx, getMousePos, drawImageAndBoundingBoxes]
  );

  useEffect(() => {
    if (!canvas) return;
    canvas.addEventListener("wheel", onWheel);
    return () => {
      canvas.removeEventListener("wheel", onWheel);
    };
  }, [canvas, onWheel]);

  const findWordInImage = useCallback(
    (evt: React.MouseEvent<HTMLCanvasElement>) => {
      if (!imageSearchResult) return;
      const mousePos = getMousePos(evt);
      if (!mousePos) return;

      imageSearchResult.forEach((block) => {
        block.lines.forEach((line) => {
          const linePolygonCanvas = line.boundingPolygon.map((coord) => {
            const [cx, cy] = translateImagePoint(coord);
            return { x: cx, y: cy };
          });

          if (pointInPolygon(linePolygonCanvas, mousePos)) {
            line.words.forEach((word) => {
              const wordPolygonCanvas = word.boundingPolygon.map((coord) => {
                const [wx, wy] = translateImagePoint(coord);
                return { x: wx, y: wy };
              });

              if (
                pointInPolygon(wordPolygonCanvas, mousePos) &&
                !tempWordArrayRef.current.includes(word)
              ) {
                tempWordArrayRef.current.push(word);
              }
            });
          }
        });
      });
    },
    [imageSearchResult, getMousePos, translateImagePoint]
  );

  const onMouseDown = useCallback(
    (evt: React.MouseEvent<HTMLCanvasElement>) => {
      if (evt.ctrlKey) {
        findWordInImage(evt);
      } else {
        setDragStartPosition(getMousePos(evt));
      }
      setIsDragging(true);
    },
    [findWordInImage, getMousePos]
  );

  const onMouseUp = useCallback(
    (evt: React.MouseEvent<HTMLCanvasElement>) => {
      if (isDragging && evt.ctrlKey) {
        setKeyword(tempWordArrayRef.current.map((el) => el.text).join(""));
      }
      setIsDragging(false);
      setDragStartPosition(null);
      tempWordArrayRef.current = [];
    },
    [isDragging, setKeyword]
  );

  const panImage = useCallback(
    (evt: React.MouseEvent<HTMLCanvasElement>) => {
      if (!dragStartPosition || !ctx) return;
      const mousePos = getMousePos(evt);
      if (mousePos) {
        const dx = mousePos.x - dragStartPosition.x;
        const dy = mousePos.y - dragStartPosition.y;
        ctx.translate(dx, dy);
        window.requestAnimationFrame(drawImageAndBoundingBoxes);
      }
    },
    [ctx, dragStartPosition, getMousePos, drawImageAndBoundingBoxes]
  );

  const onMouseMove = useCallback(
    (evt: React.MouseEvent<HTMLCanvasElement>) => {
      if (!isDragging) return;
      if (evt.ctrlKey) {
        findWordInImage(evt);
      } else {
        panImage(evt);
      }
    },
    [isDragging, findWordInImage, panImage]
  );

  const clearImage = useCallback(() => {
    setImage(null);
    setFile(null);
  }, [setImage, setFile]);

  return (
    <>
      <div className="h-96 w-full relative" ref={canvasWrapperRef}>
        {isLoading && <LoadingIndicator />}

        <canvas
          className={`${isCanvasVisible ? "border border-black" : ""} `}
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
