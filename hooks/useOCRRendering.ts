import { RefObject } from "react";
import { OCRBlock, OCRCoordinate, OCRWord } from "@/models/serverActions";

export function useOCRRendering(
  canvasRef: RefObject<HTMLCanvasElement | null>,
  imgRef: RefObject<HTMLImageElement | null>,
  imageSearchResult: OCRBlock[] | null,
  showLineBoundingBox: boolean,
  showWordBoundingBox: boolean,
  selectedWords: OCRWord[]
) {
  const getImageTransformationParameters = () => {
    const canvas = canvasRef.current;
    const img = imgRef.current;
    if (!canvas || !img || !img.width || !img.height) {
      return { ratio: 1, centerShiftX: 0, centerShiftY: 0 };
    }
    const hRatio = canvas.width / img.width;
    const vRatio = canvas.height / img.height;
    const ratio = Math.min(hRatio, vRatio);
    const centerShiftX = (canvas.width - img.width * ratio) / 2;
    const centerShiftY = (canvas.height - img.height * ratio) / 2;
    return { ratio, centerShiftX, centerShiftY };
  };

  const translateImagePoint = (point: OCRCoordinate): [number, number] => {
    const { ratio, centerShiftX, centerShiftY } =
      getImageTransformationParameters();
    return [point.x * ratio + centerShiftX, point.y * ratio + centerShiftY];
  };

  const drawPolygon = (polygon: OCRCoordinate[], strokeColor: string) => {
    const ctx = canvasRef.current?.getContext("2d");
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
  };

  const drawWord = (word: OCRWord) => {
    if (showWordBoundingBox || selectedWords.includes(word)) {
      const isSelected = selectedWords.includes(word);
      drawPolygon(word.boundingPolygon, isSelected ? "#ff0000" : "#830d30");
    }
  };

  const drawLine = (line: OCRBlock["lines"][number]) => {
    if (showLineBoundingBox) {
      drawPolygon(line.boundingPolygon, "#0066ff");
    }
    line.words.forEach(drawWord);
  };

  const drawBlock = (block: OCRBlock) => {
    block.lines.forEach(drawLine);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (ctx && canvas) {
      ctx.save();
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.restore();
    }
  };

  const drawImageAndBoundingBoxes = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    const img = imgRef.current;
    if (!ctx || !canvas || !img) return;

    clearCanvas();
    const { ratio, centerShiftX, centerShiftY } =
      getImageTransformationParameters();

    ctx.drawImage(
      img,
      0,
      0,
      img.width,
      img.height,
      centerShiftX,
      centerShiftY,
      img.width * ratio,
      img.height * ratio
    );

    imageSearchResult?.forEach(drawBlock);
  };

  return {
    drawImageAndBoundingBoxes,
    translateImagePoint,
  };
}
