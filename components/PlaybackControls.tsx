"use client";

type Props = {
  isPlaying: boolean;
  bpm: number;
  onTogglePlay: () => void;
  onBpmChange: (newBpm: number) => void;
};

export default function PlaybackControls({
  isPlaying,
  onTogglePlay,
  bpm,
  onBpmChange,
}: Props) {
  return (
    <div className="flex gap-4 p-4 border-b border-zinc-800">
      <button
        onClick={onTogglePlay}
        className={`
          px-6 py-2 rounded font-bold text-white transition-all
          ${
            isPlaying
              ? "bg-red-500 hover:bg-red-600 shadow-[0_0_15px_rgba(239,68,68,0.5)]"
              : "bg-orange-500 hover:bg-orange-600 shadow-[0_0_15px_rgba(34,197,94,0.5)]"
          }
        `}
      >
        {isPlaying ? "STOP" : "PLAY"}
      </button>
      <div className="flex flex-col">
        <label className="text-xs text-zinc-500 font-bold mb-1">
          Tempo: {bpm} BPM
        </label>
        <input
          type="range"
          min={60}
          max={240}
          step={1}
          value={bpm}
          onChange={(e) => onBpmChange(Number(e.target.value))}
          className="accent-orange-500 h-2 bg-zinc-700 rounded-lg appearance-none cursor-pointer"
        />
      </div>
      <span className="text-white font-mono">{bpm} BPM</span>
    </div>
  );
}
