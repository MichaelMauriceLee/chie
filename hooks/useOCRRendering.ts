import { useCallback } from "react";
import { OCRBlock, OCRCoordinate, OCRWord } from "@/models/serverActions";

export function useOCRRendering(
  ctx: CanvasRenderingContext2D | null,
  canvas: HTMLCanvasElement | null,
  img: HTMLImageElement,
  imageSearchResult: OCRBlock[] | null,
  showLineBoundingBox: boolean,
  showWordBoundingBox: boolean
) {
  const getImageTransformationParameters = useCallback(() => {
    if (!canvas || !img.width || !img.height) {
      return { ratio: 1, centerShiftX: 0, centerShiftY: 0 };
    }
    const hRatio = canvas.width / img.width;
    const vRatio = canvas.height / img.height;
    const ratio = Math.min(hRatio, vRatio);
    const centerShiftX = (canvas.width - img.width * ratio) / 2;
    const centerShiftY = (canvas.height - img.height * ratio) / 2;
    return { ratio, centerShiftX, centerShiftY };
  }, [canvas, img]);

  const translateImagePoint = useCallback(
    (point: OCRCoordinate): [number, number] => {
      const { ratio, centerShiftX, centerShiftY } =
        getImageTransformationParameters();
      return [point.x * ratio + centerShiftX, point.y * ratio + centerShiftY];
    },
    [getImageTransformationParameters]
  );

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

  const drawWord = useCallback(
    (word: OCRWord) => {
      if (showWordBoundingBox) {
        drawPolygon(word.boundingPolygon, "#830d30");
      }
    },
    [drawPolygon, showWordBoundingBox]
  );

  const drawLine = useCallback(
    (line: OCRBlock["lines"][number]) => {
      if (showLineBoundingBox) {
        drawPolygon(line.boundingPolygon, "#0066ff");
      }
      line.words.forEach(drawWord);
    },
    [drawPolygon, showLineBoundingBox, drawWord]
  );

  const drawBlock = useCallback(
    (block: OCRBlock) => {
      block.lines.forEach(drawLine);
    },
    [drawLine]
  );

  const clearCanvas = useCallback(() => {
    if (ctx && canvas) {
      ctx.save();
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.restore();
    }
  }, [canvas, ctx]);

  const drawImageAndBoundingBoxes = useCallback(() => {
    if (!ctx || !canvas) return;

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
  }, [
    ctx,
    canvas,
    clearCanvas,
    getImageTransformationParameters,
    imageSearchResult,
    drawBlock,
    img,
  ]);

  return {
    drawImageAndBoundingBoxes,
    translateImagePoint,
  };
}
