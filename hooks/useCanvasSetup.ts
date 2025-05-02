import { useRef, useState, useEffect } from "react";

export function useCanvasSetup(image: string) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const canvasWrapperRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(new Image());
  const [isCanvasVisible, setIsCanvasVisible] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrapper = canvasWrapperRef.current;

    if (canvas && wrapper) {
      const { width, height } = wrapper.getBoundingClientRect();
      canvas.width = width;
      canvas.height = height;

      imgRef.current.onload = () => setIsCanvasVisible(true);
      imgRef.current.src = image;
    }
  }, [image]);

  return {
    canvasRef,
    canvasWrapperRef,
    imgRef,
    isCanvasVisible,
  };
}
