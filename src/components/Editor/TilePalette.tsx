import { TileType } from '../../types/level';
import './TilePalette.css';

interface TilePaletteProps {
  selectedTile: TileType;
  onSelectTile: (tile: TileType) => void;
}

const TILE_OPTIONS: { type: TileType; label: string; color: string }[] = [
  { type: 'platform', label: 'Platform', color: '#4a5568' },
  { type: 'hazard', label: 'Hazard', color: '#e53e3e' },
  { type: 'spawn', label: 'Spawn', color: '#38a169' },
  { type: 'goal', label: 'Goal', color: '#d69e2e' },
  { type: 'empty', label: 'Erase', color: '#2d3748' },
];

export function TilePalette({ selectedTile, onSelectTile }: TilePaletteProps) {
  return (
    <div className="tile-palette">
      <h3>Tiles</h3>
      <div className="tile-options">
        {TILE_OPTIONS.map(({ type, label, color }) => (
          <button
            key={type}
            className={`tile-option ${selectedTile === type ? 'selected' : ''}`}
            onClick={() => onSelectTile(type)}
            style={{ '--tile-color': color } as React.CSSProperties}
          >
            <div className="tile-preview" />
            <span>{label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
