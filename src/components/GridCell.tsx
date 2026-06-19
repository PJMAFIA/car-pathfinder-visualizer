import { memo } from "react";
import { Car, Flag } from "lucide-react";
import { cn } from "@/lib/utils";
import type { CellStatus } from "@/hooks/useGridState";

interface GridCellProps {
  row: number;
  col: number;
  isWall: boolean;
  isStart: boolean;
  isEnd: boolean;
  status: CellStatus;
  onInteract: (row: number, col: number) => void;
  onMouseDown: () => void;
  isDrawing: boolean;
}

export const GridCell = memo(function GridCell({
  row,
  col,
  isWall,
  isStart,
  isEnd,
  status,
  onInteract,
  onMouseDown,
  isDrawing,
}: GridCellProps) {
  return (
    <div
      className={cn(
        "aspect-square border border-grid-border flex items-center justify-center transition-colors duration-150 cursor-pointer select-none",
        isWall && "bg-grid-wall",
        !isWall && status === "empty" && "bg-grid-cell",
        status === "explored" && !isStart && !isEnd && "bg-grid-explored explored-glow",
        status === "path" && !isStart && !isEnd && "bg-neon-blue neon-glow-blue",
        isStart && "bg-primary neon-glow-blue",
        isEnd && "bg-accent neon-glow-purple"
      )}
      onMouseDown={() => {
        onMouseDown();
        onInteract(row, col);
      }}
      onMouseEnter={() => {
        if (isDrawing) onInteract(row, col);
      }}
    >
      {isStart && <Car className="w-4 h-4 text-primary-foreground" />}
      {isEnd && <Flag className="w-4 h-4 text-accent-foreground" />}
    </div>
  );
});
