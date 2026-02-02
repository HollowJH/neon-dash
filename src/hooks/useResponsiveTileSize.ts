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
  padding?: ViewportPadding // Made optional
) {
  const [tileSize, setTileSize] = useState(40);

  const calculateTileSize = useCallback(() => {
    // Responsive padding based on viewport size
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    // Detect if mobile (stacked layout) vs desktop (side-by-side)
    const isMobile = viewportWidth < 768;

    // Default padding values that scale with viewport
    // Mobile: minimal horizontal padding, reserve space for stacked sidebar below
    // Desktop: larger right padding for sidebar beside canvas
    const defaultPadding = {
      top: Math.max(20, Math.min(60, viewportHeight * 0.06)),
      right: isMobile ? 24 : Math.max(220, Math.min(300, viewportWidth * 0.18)),
      bottom: isMobile ? 180 : Math.max(40, Math.min(80, viewportHeight * 0.08)),
      left: isMobile ? 24 : 48
    };

    const actualPadding = padding || defaultPadding;

    const availableWidth = viewportWidth - actualPadding.left - actualPadding.right;
    const availableHeight = viewportHeight - actualPadding.top - actualPadding.bottom;

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
  }, [gridWidth, gridHeight, padding]);

  useEffect(() => {
    calculateTileSize();

    window.addEventListener('resize', calculateTileSize);
    return () => window.removeEventListener('resize', calculateTileSize);
  }, [calculateTileSize]);

  return tileSize;
}
