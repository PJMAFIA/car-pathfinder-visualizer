import { useCallback } from "react";
import { GridCell } from "./GridCell";
import { useGridState } from "@/hooks/useGridState";
import { Toolbar } from "./Toolbar";
import { HUD } from "./HUD";

export function NavigationGrid() {
  const {
    grid,
    start,
    end,
    tool,
    setTool,
    cellStatuses,
    isAnimating,
    stats,
    isDrawing,
    setIsDrawing,
    handleCellInteraction,
    clearBoard,
    runAlgorithm,
    GRID_SIZE,
  } = useGridState();

  const onMouseUp = useCallback(() => setIsDrawing(false), [setIsDrawing]);
  const onMouseDown = useCallback(() => setIsDrawing(true), [setIsDrawing]);

  return (
    <div
      className="min-h-screen flex flex-col lg:flex-row items-center justify-center gap-6 p-4 lg:p-8"
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseUp}
    >
      {/* Left panel */}
      <div className="w-full lg:w-72 flex flex-col gap-4 order-2 lg:order-1">
        <div className="glass-panel p-5">
          <h1 className="text-lg font-bold mb-1 text-foreground">
            🚗 Auto Nav Visualizer
          </h1>
          <p className="text-xs text-muted-foreground mb-4">
            Draw walls, place start & end, then run the pathfinder.
          </p>
          <Toolbar tool={tool} setTool={setTool} disabled={isAnimating} />
        </div>
        <HUD
          stats={stats}
          isAnimating={isAnimating}
          canRun={!!start && !!end}
          onRun={runAlgorithm}
          onClear={clearBoard}
        />
      </div>

      {/* Grid */}
      <div className="order-1 lg:order-2 glass-panel p-3 inline-block">
        <div
          className="grid select-none"
          style={{
            gridTemplateColumns: `repeat(${GRID_SIZE}, minmax(0, 1fr))`,
            width: `min(80vw, 560px)`,
            height: `min(80vw, 560px)`,
          }}
        >
          {Array.from({ length: GRID_SIZE }).map((_, r) =>
            Array.from({ length: GRID_SIZE }).map((_, c) => (
              <GridCell
                key={`${r}-${c}`}
                row={r}
                col={c}
                isWall={grid[r][c] === 1}
                isStart={!!start && start[0] === r && start[1] === c}
                isEnd={!!end && end[0] === r && end[1] === c}
                status={cellStatuses[r][c]}
                onInteract={handleCellInteraction}
                onMouseDown={onMouseDown}
                isDrawing={isDrawing}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
