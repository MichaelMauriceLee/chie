import { useRef, useState, useEffect, RefObject } from "react";
import {
  OCRBlock,
  OCRCoordinate,
  OCRLine,
  OCRWord,
} from "@/models/serverActions";
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

function getAllLines(blocks: OCRBlock[]): OCRLine[] {
  return blocks.flatMap((block) => block.lines);
}

export function useOCRInteraction(
  canvasRef: RefObject<HTMLCanvasElement | null>,
  imageSearchResult: OCRBlock[] | null,
  translateImagePoint: (coord: OCRCoordinate) => [number, number],
  setKeyword: React.Dispatch<React.SetStateAction<string>>,
  wordSelectionMode: WordSelectionMode,
  drawImageAndBoundingBoxes: () => void,
  setSelectedWords: React.Dispatch<React.SetStateAction<OCRWord[]>>
) {
  const tempWordArrayRef = useRef<OCRWord[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [cursorStyle, setCursorStyle] = useState("default");
  const [dragStartPosition, setDragStartPosition] =
    useState<OCRCoordinate | null>(null);

  const resetSelection = () => {
    setIsDragging(false);
    setDragStartPosition(null);
    tempWordArrayRef.current = [];
    setSelectedWords([]);
    setCursorStyle("default");
    window.requestAnimationFrame(drawImageAndBoundingBoxes);
  };

  const getMousePos = (evt: React.MouseEvent<HTMLCanvasElement> | WheelEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    const x =
      ((evt.clientX - rect.left) / (rect.right - rect.left)) * canvas.width;
    const y =
      ((evt.clientY - rect.top) / (rect.bottom - rect.top)) * canvas.height;

    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    const transform = ctx.getTransform();
    const inverseZoom = 1 / transform.a;

    return {
      x: inverseZoom * x - inverseZoom * transform.e,
      y: inverseZoom * y - inverseZoom * transform.f,
    };
  };

  const findWordInImage = (evt: React.MouseEvent<HTMLCanvasElement>) => {
    if (!imageSearchResult) return;
    const mousePos = getMousePos(evt);
    if (!mousePos) return;

    for (const line of getAllLines(imageSearchResult)) {
      const linePolygonCanvas = line.boundingPolygon.map((coord) => {
        const [x, y] = translateImagePoint(coord);
        return { x, y };
      });

      if (!pointInPolygon(linePolygonCanvas, mousePos)) continue;

      for (const word of line.words) {
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
      }
    }
  };

  const onMouseDown = (evt: React.MouseEvent<HTMLCanvasElement>) => {
    if (evt.ctrlKey) {
      findWordInImage(evt);
      setCursorStyle("crosshair");
      setSelectedWords([...tempWordArrayRef.current]);
    } else {
      setDragStartPosition(getMousePos(evt));
      setCursorStyle("grabbing");
    }
    setIsDragging(true);
  };

  const onMouseUp = (evt: React.MouseEvent<HTMLCanvasElement>) => {
    if (isDragging && evt.ctrlKey) {
      const selectedWords = tempWordArrayRef.current
        .map((el) => el.text)
        .join("");
      setKeyword((prev) => wordSelectionMode === WordSelectionMode.Add
        ? prev + selectedWords
        : selectedWords
      );
    }
    resetSelection();
  };

  // Add global mouse up handler
  useEffect(() => {
    const handleGlobalMouseUp = () => {
      if (isDragging) {
        resetSelection();
      }
    };

    window.addEventListener("mouseup", handleGlobalMouseUp);
    return () => {
      window.removeEventListener("mouseup", handleGlobalMouseUp);
    };
  });

  const panImage = (evt: React.MouseEvent<HTMLCanvasElement>) => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!dragStartPosition || !ctx) return;
    const mousePos = getMousePos(evt);
    if (mousePos) {
      const dx = mousePos.x - dragStartPosition.x;
      const dy = mousePos.y - dragStartPosition.y;
      ctx.translate(dx, dy);
      window.requestAnimationFrame(drawImageAndBoundingBoxes);
    }
  };

  const onMouseMove = (evt: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging) return;
    if (evt.ctrlKey) {
      findWordInImage(evt);
      setSelectedWords([...tempWordArrayRef.current]);
    } else {
      panImage(evt);
    }
  };

  const onWheel = (evt: WheelEvent) => {
    evt.preventDefault();
    const ctx = canvasRef.current?.getContext("2d");
    const mousePos = getMousePos(evt);
    if (mousePos && ctx) {
      const zoom = evt.deltaY < 0 ? 1.1 : 0.9;
      ctx.translate(mousePos.x, mousePos.y);
      ctx.scale(zoom, zoom);
      ctx.translate(-mousePos.x, -mousePos.y);
      window.requestAnimationFrame(drawImageAndBoundingBoxes);
    }
  };

  return {
    onMouseDown,
    onMouseMove,
    onMouseUp,
    onWheel,
    cursorStyle,
  };
}
