"use client";

import { useState } from "react";

const trackNames = ["Kick", "Snare", "Hi-Hat", "Clap"];

export default function Sequencer() {
  const [grid, setGrid] = useState(() =>
    new Array(4).fill(null).map(() => Array(16).fill(false)),
  );

  const toggleStep = (trackIndex: number, stepIndex: number) => {
    const newGrid = [...grid];
    newGrid[trackIndex] = [...newGrid[trackIndex]];
    newGrid[trackIndex][stepIndex] = !newGrid[trackIndex][stepIndex];
    setGrid(newGrid);
  };

  return (
    <div className="p-8 bg-zinc-900 rounded-xl">
      <div className="flex flex-col gap-4">
        {grid.map((row, trackIndex) => (
          <div key={trackIndex} className="flex items-center gap-4">
            <span className="w-16 text-zinc-400 font-bold text-sm text-right">
              {trackNames[trackIndex]}
            </span>
            <div className="flex gap-1">
              {row.map((isActive, stepIndex) => (
                <button
                  key={stepIndex}
                  onClick={() => toggleStep(trackIndex, stepIndex)}
                  className={`
                    w-8 h-10 rounded-sm border border-zinc-700 transition-colors
                    ${
                      isActive
                        ? "bg-orange-500 border-orange-400 shadow-[0_0_10px_rgba(249,115,22,0.5)]"
                        : "bg-zinc-800 hover:bg-zinc-700"
                    }
                  `}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
