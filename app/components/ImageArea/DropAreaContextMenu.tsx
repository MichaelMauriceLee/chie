import React from 'react';
import useContextMenu from '../../hooks/useContextMenu';

interface DropAreaContextMenuProps {
    setFile: (param: File | null) => void
  }

const DropAreaContextMenu: React.FC<DropAreaContextMenuProps> = ({ setFile }) => {
  const { anchorPoint, show } = useContextMenu();

  const onClick = async () => {
    const clipboardItems = await navigator.clipboard.read();
    if (clipboardItems.length !== 0 && clipboardItems[0].types.includes('image/png')) {
      const clipboardItem = clipboardItems[0];
      const blob = await clipboardItem.getType('image/png');
      setFile(blob as File);
    }
  };

  if (show) {
    return (
      <div
        className="absolute p-4 m-0 border-2 border-black w-50 hover:bg-red-500 bg-white"
        style={{ top: anchorPoint.y, left: anchorPoint.x + 10 }}
      >
        <button
          type="button"
          onClick={onClick}
        >
          Paste image from clipboard
        </button>
      </div>
    );
  }
  return <></>;
};

export default DropAreaContextMenu;
