import { Route, Compass, Trash2, Play, Loader2 } from "lucide-react";

interface HUDProps {
  stats: { cost: number; explored: number } | null;
  isAnimating: boolean;
  canRun: boolean;
  onRun: () => void;
  onClear: () => void;
}

export function HUD({ stats, isAnimating, canRun, onRun, onClear }: HUDProps) {
  return (
    <div className="glass-panel p-5 flex flex-col gap-4">
      <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
        Dashboard
      </h2>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-secondary rounded-lg p-3 text-center">
          <Route className="w-5 h-5 mx-auto mb-1 text-neon-blue" />
          <p className="text-xs text-muted-foreground">Path Cost</p>
          <p className="text-lg font-bold text-foreground">
            {stats ? (stats.cost >= 0 ? stats.cost : "N/A") : "—"}
          </p>
        </div>
        <div className="bg-secondary rounded-lg p-3 text-center">
          <Compass className="w-5 h-5 mx-auto mb-1 text-neon-purple" />
          <p className="text-xs text-muted-foreground">Nodes Explored</p>
          <p className="text-lg font-bold text-foreground">
            {stats ? stats.explored : "—"}
          </p>
        </div>
      </div>

      <div className="flex gap-2">
        <button
          disabled={!canRun || isAnimating}
          onClick={onRun}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-semibold text-sm bg-primary text-primary-foreground disabled:opacity-40 transition-all hover:brightness-110 neon-glow-blue"
        >
          {isAnimating ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Play className="w-4 h-4" />
          )}
          {isAnimating ? "Running…" : "Run Algorithm"}
        </button>
        <button
          onClick={onClear}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg font-semibold text-sm bg-destructive text-destructive-foreground transition-all hover:brightness-110"
        >
          <Trash2 className="w-4 h-4" />
          Clear
        </button>
      </div>
    </div>
  );
}
