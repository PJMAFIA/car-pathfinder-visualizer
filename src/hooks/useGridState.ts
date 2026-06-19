import { useState, useCallback, useRef } from "react";

export type Tool = "start" | "end" | "wall" | "erase";
export type CellStatus = "empty" | "wall" | "explored" | "path";

const GRID_SIZE = 20;

const createEmptyGrid = (): number[][] =>
  Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill(0));

export interface SolveResult {
  visited_nodes: [number, number][];
  path: [number, number][];
  cost: number;
  nodes_explored: number;
  success: boolean;
}

export function useGridState() {
  const [grid, setGrid] = useState<number[][]>(createEmptyGrid);
  const [start, setStart] = useState<[number, number] | null>(null);
  const [end, setEnd] = useState<[number, number] | null>(null);
  const [tool, setTool] = useState<Tool>("wall");
  const [cellStatuses, setCellStatuses] = useState<CellStatus[][]>(
    () => Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill("empty"))
  );
  const [isAnimating, setIsAnimating] = useState(false);
  const [stats, setStats] = useState<{ cost: number; explored: number } | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const animationRef = useRef<NodeJS.Timeout[]>([]);

  const clearAnimations = useCallback(() => {
    animationRef.current.forEach(clearTimeout);
    animationRef.current = [];
  }, []);

  const handleCellInteraction = useCallback(
    (row: number, col: number) => {
      if (isAnimating) return;

      if (tool === "start") {
        if (grid[row][col] === 1) return;
        setStart([row, col]);
      } else if (tool === "end") {
        if (grid[row][col] === 1) return;
        setEnd([row, col]);
      } else if (tool === "wall") {
        if ((start && start[0] === row && start[1] === col) || (end && end[0] === row && end[1] === col)) return;
        setGrid((prev) => {
          const next = prev.map((r) => [...r]);
          next[row][col] = 1;
          return next;
        });
      } else if (tool === "erase") {
        if ((start && start[0] === row && start[1] === col)) { setStart(null); return; }
        if ((end && end[0] === row && end[1] === col)) { setEnd(null); return; }
        setGrid((prev) => {
          const next = prev.map((r) => [...r]);
          next[row][col] = 0;
          return next;
        });
      }
    },
    [tool, isAnimating, start, end, grid]
  );

  const clearBoard = useCallback(() => {
    clearAnimations();
    setGrid(createEmptyGrid());
    setStart(null);
    setEnd(null);
    setCellStatuses(Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill("empty")));
    setIsAnimating(false);
    setStats(null);
  }, [clearAnimations]);

  const clearPath = useCallback(() => {
    clearAnimations();
    setCellStatuses(Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill("empty")));
    setIsAnimating(false);
    setStats(null);
  }, [clearAnimations]);

  const animateResult = useCallback(
    (result: SolveResult) => {
      clearPath();
      setIsAnimating(true);

      const delay = 15;
      const visited = result.visited_nodes;
      const path = result.path;

      visited.forEach(([r, c], i) => {
        const t = setTimeout(() => {
          setCellStatuses((prev) => {
            const next = prev.map((row) => [...row]);
            next[r][c] = "explored";
            return next;
          });
        }, i * delay);
        animationRef.current.push(t);
      });

      const pathStart = visited.length * delay + 200;
      path.forEach(([r, c], i) => {
        const t = setTimeout(() => {
          setCellStatuses((prev) => {
            const next = prev.map((row) => [...row]);
            next[r][c] = "path";
            return next;
          });
        }, pathStart + i * 40);
        animationRef.current.push(t);
      });

      const finishT = setTimeout(() => {
        setIsAnimating(false);
        setStats({ cost: result.cost, explored: result.nodes_explored });
      }, pathStart + path.length * 40 + 100);
      animationRef.current.push(finishT);
    },
    [clearPath]
  );

const runAlgorithm = useCallback(async () => {
    if (!start || !end || isAnimating) return;
    clearPath();
    setIsAnimating(true);

    try {
      // CHANGED: Now points to the Vercel serverless function route
      const res = await fetch("/api/solve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          grid,
          start,
          end,
          algorithm: "A_STAR",
        }),
      });

      if (!res.ok) throw new Error("API error");
      const data: SolveResult = await res.json();

      if (!data.success) {
        setIsAnimating(false);
        setStats({ cost: -1, explored: data.nodes_explored });
        return;
      }

      animateResult(data);
    } catch (err) {
      console.error("Failed to reach solver API:", err);
      setIsAnimating(false);
    }
  }, [start, end, grid, isAnimating, clearPath, animateResult]);

  return {
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
  };
}
