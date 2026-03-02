"use client";

interface ViewerControlsProps {
  wireframe: boolean;
  showGrid: boolean;
  onToggleWireframe: () => void;
  onToggleGrid: () => void;
}

export default function ViewerControls({
  wireframe,
  showGrid,
  onToggleWireframe,
  onToggleGrid,
}: ViewerControlsProps) {
  return (
    <div className="absolute bottom-4 left-4 flex gap-2 z-10">
      <button
        onClick={onToggleWireframe}
        className={`px-3 py-1.5 text-xs rounded-lg border transition-colors ${
          wireframe
            ? "bg-purple-600 border-purple-500 text-white"
            : "bg-black/60 border-white/20 text-gray-300 hover:border-white/40"
        }`}
      >
        Wireframe
      </button>
      <button
        onClick={onToggleGrid}
        className={`px-3 py-1.5 text-xs rounded-lg border transition-colors ${
          showGrid
            ? "bg-purple-600 border-purple-500 text-white"
            : "bg-black/60 border-white/20 text-gray-300 hover:border-white/40"
        }`}
      >
        Grid
      </button>
    </div>
  );
}
