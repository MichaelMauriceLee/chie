import { useEffect, useCallback, useState } from 'react';

interface AnchorPoint {
    x: number
    y: number
}

interface UseContextMenu {
    anchorPoint: AnchorPoint
    show: boolean
}

const useContextMenu = (): UseContextMenu => {
  const [anchorPoint, setAnchorPoint] = useState({ x: 0, y: 0 });
  const [show, setShow] = useState(false);

  const handleContextMenu = useCallback(
    (event) => {
      event.preventDefault();
      setAnchorPoint({ x: event.pageX, y: event.pageY });
      setShow(true);
    },
    [setShow, setAnchorPoint],
  );

  const handleClick = useCallback(() => (show ? setShow(false) : null), [show]);

  useEffect(() => {
    document.addEventListener('click', handleClick);
    document.addEventListener('contextmenu', handleContextMenu);
    return () => {
      document.removeEventListener('click', handleClick);
      document.removeEventListener('contextmenu', handleContextMenu);
    };
  });
  return { anchorPoint, show };
};

export default useContextMenu;
