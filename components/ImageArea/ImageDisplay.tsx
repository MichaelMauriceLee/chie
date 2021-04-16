import { AxiosError } from 'axios';
import React, { useEffect, useRef, useState } from 'react';
import useNotification from '../../hooks/useNotification';
import useTextInImageSearch from '../../hooks/useTextInImageSearch';
import { Word } from '../../models/ImageSearchResult';
import { NotificationType } from '../../models/Notification';
import LoadingIndicator from './LoadingIndicator';

interface ImageDisplayProps {
  image: File;
  showLineBoundingBox: boolean;
  showWordBoundingBox: boolean;
  setKeyword: (params: string) => void;
}

interface Coordinate {
  x: number;
  y: number;
}

const ImageDisplay: React.FC<ImageDisplayProps> = ({
  image, showLineBoundingBox, showWordBoundingBox, setKeyword,
}) => {
  const [isCanvasVisible, setIsCanvasVisible] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStartPosition, setDragStartPosition] = useState<Coordinate | null>(null);

  const canvasWrapperRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement>(new Image());
  const tempWordArrayRef = useRef<Word[]>([]);

  const dispatch = useNotification();
  const createErrorNotification = (error:AxiosError) => {
    dispatch({
      type: NotificationType.Error,
      message: error.response?.data ?? error.message,
    });
  };

  const {
    data: imageSearchResult, isLoading, refetch,
  } = useTextInImageSearch(image, createErrorNotification);

  const canvasWrapper = canvasWrapperRef.current;
  const canvas = canvasRef.current;
  const ctx = canvasRef.current?.getContext('2d');

  const transformMousePoint = (x: number, y: number) => {
    if (ctx) {
      const transform = ctx.getTransform();
      const inverseZoom = 1 / transform.a;

      const transformedX = inverseZoom * x - inverseZoom * transform.e;
      const transformedY = inverseZoom * y - inverseZoom * transform.f;
      return { x: transformedX, y: transformedY };
    }
    return { x: 0, y: 0 };
  };

  const getMousePos = (evt: React.WheelEvent<HTMLCanvasElement> |
    React.MouseEvent<HTMLCanvasElement> | WheelEvent) => {
    if (canvas) {
      const rect = canvas.getBoundingClientRect();

      const mousePos = {
        x: ((evt.clientX - rect.left) / (rect.right - rect.left)) * canvas.width,
        y: ((evt.clientY - rect.top) / (rect.bottom - rect.top)) * canvas.height,
      };

      return transformMousePoint(mousePos.x, mousePos.y);
    }
    return null;
  };

  const getImageTransformationParameters = () => {
    const hRatio = canvas ? canvas.width / imgRef.current.width : 1;
    const vRatio = canvas ? canvas.height / imgRef.current.height : 1;
    const ratio = Math.min(hRatio, vRatio);
    const centerShiftX = canvas ? (canvas.width - imgRef.current.width * ratio) / 2 : 0;
    const centerShiftY = canvas ? (canvas.height - imgRef.current.height * ratio) / 2 : 0;
    return {
      ratio,
      centerShiftX,
      centerShiftY,
    };
  };

  const translateImagePoint = (point: [number, number]): [number, number] => {
    const { ratio, centerShiftX, centerShiftY } = getImageTransformationParameters();
    return [point[0] * ratio + centerShiftX, point[1] * ratio + centerShiftY];
  };

  const createArrayUsedForDrawingBox = (points: number[]) => {
    const newArr = [];
    for (let i = 0; i < points.length; i += 1) {
      if (!(i === 0 || i === 1)) {
        newArr.push(points[i]);
      }
    }
    newArr.push(points[0]);
    newArr.push(points[1]);
    return newArr;
  };

  const clearCanvas = () => {
    if (ctx && canvas) {
      ctx.save();
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.restore();
    }
  };

  const drawBoundingBox = (points: number[], strokeColor: string) => {
    if (ctx) {
      ctx.beginPath();
      let translatedPoint = translateImagePoint([points[0], points[1]]);
      ctx.moveTo(translatedPoint[0], translatedPoint[1]);
      const arrForDrawing = createArrayUsedForDrawingBox(points);
      for (let i = 0; i < arrForDrawing.length; i += 2) {
        translatedPoint = translateImagePoint([arrForDrawing[i], arrForDrawing[i + 1]]);
        ctx.lineTo(translatedPoint[0], translatedPoint[1]);
      }
      ctx.strokeStyle = strokeColor;
      ctx.stroke();
    }
  };

  const drawImageAndBoundingBoxes = () => {
    if (image && ctx && canvas) {
      clearCanvas();

      const { ratio, centerShiftX, centerShiftY } = getImageTransformationParameters();
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(imgRef.current, 0, 0, imgRef.current.width, imgRef.current.height,
        centerShiftX, centerShiftY, imgRef.current.width * ratio, imgRef.current.height * ratio);

      if (imageSearchResult) {
        imageSearchResult.forEach((result) => {
          result.lines.forEach((line) => {
            if (showLineBoundingBox) {
              const { boundingBox } = line;
              drawBoundingBox(boundingBox, '#0066ff');
            }
            line.words.forEach((word) => {
              if (showWordBoundingBox) {
                const { boundingBox: wordBoundingBox } = word;
                drawBoundingBox(wordBoundingBox, '#830d30');
              }
            });
          });
        });
      }
    }
  };

  useEffect(() => {
    refetch();
  }, []);

  useEffect(() => {
    if (canvas && canvasWrapper) {
      canvas.height = canvasWrapper.getBoundingClientRect().height;
      canvas.width = canvasWrapper.getBoundingClientRect().width;
      const fr = new FileReader();
      fr.onload = () => {
        if (fr.result) {
          imgRef.current.onload = drawImageAndBoundingBoxes;
          imgRef.current.src = fr.result.toString();
          setIsCanvasVisible(true);
        }
      };
      fr.readAsDataURL(image);
    }
  }, [canvas]);

  useEffect(() => {
    window.requestAnimationFrame(drawImageAndBoundingBoxes);
  }, [imageSearchResult, showLineBoundingBox, showWordBoundingBox]);

  const onWheel = (evt: WheelEvent) => {
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
  };

  useEffect(() => {
    canvas?.addEventListener('wheel', onWheel);
    return () => {
      canvas?.removeEventListener('wheel', onWheel);
    };
  });

  const checkIfPointWithinBoundingBox = (boundingBox: number[], point: Coordinate) => {
    // assume axis aligned boxes (to speed up calculations)
    const { x, y } = point;
    const topLeftPoint = translateImagePoint([boundingBox[0], boundingBox[1]]);
    const bottomRightPoint = translateImagePoint([boundingBox[4], boundingBox[5]]);
    if (x >= topLeftPoint[0]
      && x <= bottomRightPoint[0]
      && y >= topLeftPoint[1]
      && y <= bottomRightPoint[1]) {
      return true;
    }
    return false;
  };

  const findWordInImage = (evt: React.MouseEvent<HTMLCanvasElement>) => {
    const mousePos = getMousePos(evt);
    if (mousePos && imageSearchResult) {
      imageSearchResult.forEach((result) => {
        result.lines.forEach((line) => {
          const { boundingBox } = line;
          if (checkIfPointWithinBoundingBox(boundingBox, mousePos)) {
            line.words.forEach((word) => {
              const { boundingBox: wordBoundingBox } = word;
              if (checkIfPointWithinBoundingBox(wordBoundingBox, mousePos)
              && !tempWordArrayRef.current.includes(word)) {
                tempWordArrayRef.current.push(word);
              }
            });
          }
        });
      });
    }
  };

  const onMouseDown = (evt: React.MouseEvent<HTMLCanvasElement>) => {
    if (evt.ctrlKey) {
      findWordInImage(evt);
    } else {
      setDragStartPosition(getMousePos(evt));
    }
    setIsDragging(true);
  };

  const onMouseUp = (evt: React.MouseEvent<HTMLCanvasElement>) => {
    if (isDragging && evt.ctrlKey) {
      setKeyword(tempWordArrayRef.current.map((el) => el.text).join(''));
    }
    setIsDragging(false);
    setDragStartPosition(null);
    tempWordArrayRef.current = [];
  };

  const panImage = (evt: React.MouseEvent<HTMLCanvasElement>) => {
    const mousePos = getMousePos(evt);
    if (dragStartPosition && mousePos) {
      const { x, y } = mousePos;
      const dx = x - dragStartPosition?.x;
      const dy = y - dragStartPosition?.y;
      ctx?.translate(dx, dy);
      window.requestAnimationFrame(drawImageAndBoundingBoxes);
    }
  };

  const onMouseMove = (evt: React.MouseEvent<HTMLCanvasElement>) => {
    if (isDragging) {
      if (evt.ctrlKey) {
        findWordInImage(evt);
      } else {
        panImage(evt);
      }
    }
  };

  return (
    <div className="h-96 w-full relative" ref={canvasWrapperRef}>
      {isLoading && <LoadingIndicator />}
      <canvas
        className={`${isCanvasVisible ? 'border border-black' : ''} `}
        ref={canvasRef}
        onMouseDown={onMouseDown}
        onMouseUp={onMouseUp}
        onMouseMove={onMouseMove}
      />
    </div>
  );
};

export default ImageDisplay;
