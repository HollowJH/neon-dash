import { useState, useEffect, useCallback } from 'react';

interface ViewportPadding {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export function useResponsiveTileSize(
  gridWidth: number,
  gridHeight: number,
  padding: ViewportPadding = { top: 100, right: 100, bottom: 100, left: 300 }
) {
  const [tileSize, setTileSize] = useState(40);

  const calculateTileSize = useCallback(() => {
    const availableWidth = window.innerWidth - padding.left - padding.right;
    const availableHeight = window.innerHeight - padding.top - padding.bottom;

    const tileSizeByWidth = Math.floor(availableWidth / gridWidth);
    const tileSizeByHeight = Math.floor(availableHeight / gridHeight);

    // Use the smaller size to ensure everything fits
    const newTileSize = Math.max(
      20, // Minimum tile size for usability
      Math.min(
        60, // Maximum tile size to prevent huge tiles on large screens
        Math.min(tileSizeByWidth, tileSizeByHeight)
      )
    );

    setTileSize(newTileSize);
  }, [gridWidth, gridHeight, padding.top, padding.right, padding.bottom, padding.left]);

  useEffect(() => {
    calculateTileSize();

    window.addEventListener('resize', calculateTileSize);
    return () => window.removeEventListener('resize', calculateTileSize);
  }, [calculateTileSize]);

  return tileSize;
}
