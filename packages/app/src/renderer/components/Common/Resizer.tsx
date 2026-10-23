import React, { useCallback, useEffect, useState } from 'react';
import { Box, alpha, useTheme } from '@mui/material';

interface ResizerProps {
  onResize: (newWidth: number) => void;
  width: number;
  minWidth?: number;
  maxWidth?: number;
}

export const Resizer: React.FC<ResizerProps> = ({
  onResize,
  width,
  minWidth = 180,
  maxWidth = 600
}) => {
  const theme = useTheme();
  const [isDragging, setIsDragging] = useState(false);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);

    const startX = e.clientX;
    const startWidth = width;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = moveEvent.clientX - startX;
      const targetWidth = Math.min(Math.max(startWidth + deltaX, minWidth), maxWidth);
      onResize(targetWidth);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  }, [width, minWidth, maxWidth, onResize]);

  return (
    <Box
      onMouseDown={handleMouseDown}
      sx={{
        width: 5,
        minWidth: 5,
        cursor: 'col-resize',
        userSelect: 'none',
        position: 'relative',
        zIndex: 10,
        backgroundColor: isDragging
          ? alpha(theme.palette.primary.main, 0.5)
          : 'transparent',
        transition: 'background-color 0.15s ease',
        '&:hover': {
          backgroundColor: alpha(theme.palette.primary.main, 0.4)
        },
        '&::after': {
          content: '""',
          position: 'absolute',
          top: 0,
          bottom: 0,
          left: 2,
          width: 1,
          backgroundColor: theme.palette.divider
        }
      }}
    />
  );
};
