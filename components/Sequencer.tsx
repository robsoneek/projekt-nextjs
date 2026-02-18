"use client";

import { useState, useEffect } from "react";

type Props = {
  currentStep: number;
  customSounds: {name: string, url: string}[];
  trackUrls: string[];
  setTrackUrls: (urls: string[]) => void;
};

const trackNames = ["Kick", "Snare", "Hi-Hat", "Clap"];

export default function Sequencer({ currentStep, customSounds, trackUrls, setTrackUrls }: Props) {
  const [grid, setGrid] = useState(() =>
    new Array(4).fill(null).map(() => Array(16).fill(false)),
  );

  const toggleStep = (trackIndex: number, stepIndex: number) => {
    const newGrid = [...grid];
    newGrid[trackIndex] = [...newGrid[trackIndex]];
    newGrid[trackIndex][stepIndex] = !newGrid[trackIndex][stepIndex];
    setGrid(newGrid);
  };

  useEffect(() => {
    grid.forEach((row, trackIndex) => {
      const isActive = row[currentStep];
      const soundUrl = trackUrls[trackIndex];

      if (isActive && soundUrl) {
        const audio = new Audio(soundUrl);
        audio.play().catch((err) => console.log("Waiting for user interaction...")); 
      }
    });
  }, [currentStep]);

  return (
    <div className="p-8 bg-zinc-900 rounded-xl">
      <div className="flex flex-col gap-4">
        {grid.map((row, trackIndex) => (
          <div key={trackIndex} className="flex items-center gap-4">
            <select 
              value={trackUrls[trackIndex]}
              onChange={(e) => {
                const newUrls = [...trackUrls];
                newUrls[trackIndex] = e.target.value;
                setTrackUrls(newUrls);
              }}
              className="w-24 bg-zinc-800 text-xs text-zinc-300 p-1 rounded border border-zinc-700 outline-none"
            >
              <option value="">Select...</option>
              {customSounds.map((sound, i) => (
                <option key={i} value={sound.url}>
                  {sound.name}
                </option>
              ))}
            </select>
            <div className="flex gap-1">
              {row.map((isActive, stepIndex) => {
                const isCurrent = stepIndex === currentStep;
                return (
                  <button
                    key={stepIndex}
                    onClick={() => toggleStep(trackIndex, stepIndex)}
                    className={`
                      w-8 h-10 rounded-sm transition-all duration-75 border
                      ${isCurrent ? "border-white border-b-4" : "border-zinc-700"}
                      ${
                        isActive
                          ? isCurrent
                            ? "bg-orange-400 shadow-[0_0_15px_rgba(251,146,60,0.8)]"
                            : "bg-orange-500 border-orange-400 shadow-[0_0_10px_rgba(249,115,22,0.5)]"
                          : isCurrent
                            ? "bg-zinc-700"
                            : "bg-zinc-800 hover:bg-zinc-700"
                      }
                    `}
                  />
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
