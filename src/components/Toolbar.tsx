import { Car, Flag, Square, Eraser } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Tool } from "@/hooks/useGridState";

interface ToolbarProps {
  tool: Tool;
  setTool: (t: Tool) => void;
  disabled: boolean;
}

const tools: { id: Tool; label: string; icon: React.ReactNode }[] = [
  { id: "start", label: "Place Car", icon: <Car className="w-4 h-4" /> },
  { id: "end", label: "Place Flag", icon: <Flag className="w-4 h-4" /> },
  { id: "wall", label: "Draw Walls", icon: <Square className="w-4 h-4" /> },
  { id: "erase", label: "Erase", icon: <Eraser className="w-4 h-4" /> },
];

export function Toolbar({ tool, setTool, disabled }: ToolbarProps) {
  return (
    <div className="flex gap-2 flex-wrap">
      {tools.map((t) => (
        <button
          key={t.id}
          disabled={disabled}
          onClick={() => setTool(t.id)}
          className={cn(
            "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all",
            "border border-glass-border",
            tool === t.id
              ? "bg-primary text-primary-foreground neon-glow-blue"
              : "bg-secondary text-secondary-foreground hover:bg-muted"
          )}
        >
          {t.icon}
          {t.label}
        </button>
      ))}
    </div>
  );
}
