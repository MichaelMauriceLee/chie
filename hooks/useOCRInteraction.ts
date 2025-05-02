import { useCallback, useRef, useState } from "react";
import { OCRBlock, OCRCoordinate, OCRWord } from "@/models/serverActions";
import { WordSelectionMode } from "@/store/atoms";

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

    if (intersects) inside = !inside;
  }
  return inside;
}

export function useOCRInteraction(
  canvas: HTMLCanvasElement | null,
  ctx: CanvasRenderingContext2D | null,
  imageSearchResult: OCRBlock[] | null,
  translateImagePoint: (coord: OCRCoordinate) => [number, number],
  setKeyword: React.Dispatch<React.SetStateAction<string>>,
  wordSelectionMode: WordSelectionMode,
  drawImageAndBoundingBoxes: () => void
) {
  const tempWordArrayRef = useRef<OCRWord[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [cursorStyle, setCursorStyle] = useState("default");
  const [dragStartPosition, setDragStartPosition] =
    useState<OCRCoordinate | null>(null);

  const getMousePos = useCallback(
    (evt: React.MouseEvent<HTMLCanvasElement> | WheelEvent) => {
      if (!canvas) return null;
      const rect = canvas.getBoundingClientRect();
      const x =
        ((evt.clientX - rect.left) / (rect.right - rect.left)) * canvas.width;
      const y =
        ((evt.clientY - rect.top) / (rect.bottom - rect.top)) * canvas.height;

      if (!ctx) return null;
      const transform = ctx.getTransform();
      const inverseZoom = 1 / transform.a;

      return {
        x: inverseZoom * x - inverseZoom * transform.e,
        y: inverseZoom * y - inverseZoom * transform.f,
      };
    },
    [canvas, ctx]
  );

  const findWordInImage = useCallback(
    (evt: React.MouseEvent<HTMLCanvasElement>) => {
      if (!imageSearchResult) return;
      const mousePos = getMousePos(evt);
      if (!mousePos) return;

      imageSearchResult.forEach((block) => {
        block.lines.forEach((line) => {
          const linePolygonCanvas = line.boundingPolygon.map((coord) => {
            const [x, y] = translateImagePoint(coord);
            return { x, y };
          });

          if (pointInPolygon(linePolygonCanvas, mousePos)) {
            line.words.forEach((word) => {
              const wordPolygonCanvas = word.boundingPolygon.map((coord) => {
                const [x, y] = translateImagePoint(coord);
                return { x, y };
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
        setCursorStyle("crosshair");
      } else {
        setDragStartPosition(getMousePos(evt));
        setCursorStyle("grabbing");
      }
      setIsDragging(true);
    },
    [findWordInImage, getMousePos]
  );

  const onMouseUp = useCallback(
    (evt: React.MouseEvent<HTMLCanvasElement>) => {
      if (isDragging && evt.ctrlKey) {
        const selectedWords = tempWordArrayRef.current
          .map((el) => el.text)
          .join("");
        setKeyword((prev) =>
          wordSelectionMode === WordSelectionMode.Add
            ? prev + selectedWords
            : selectedWords
        );
      }
      setIsDragging(false);
      setDragStartPosition(null);
      tempWordArrayRef.current = [];
      setCursorStyle("default");
      window.requestAnimationFrame(drawImageAndBoundingBoxes);
    },
    [isDragging, setKeyword, wordSelectionMode, drawImageAndBoundingBoxes]
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

  const onWheel = useCallback(
    (evt: WheelEvent) => {
      evt.preventDefault();
      const mousePos = getMousePos(evt);
      if (mousePos && ctx) {
        const zoom = evt.deltaY < 0 ? 1.1 : 0.9;
        ctx.translate(mousePos.x, mousePos.y);
        ctx.scale(zoom, zoom);
        ctx.translate(-mousePos.x, -mousePos.y);
        window.requestAnimationFrame(drawImageAndBoundingBoxes);
      }
    },
    [ctx, getMousePos, drawImageAndBoundingBoxes]
  );

  return {
    onMouseDown,
    onMouseMove,
    onMouseUp,
    onWheel,
    cursorStyle,
  };
}
