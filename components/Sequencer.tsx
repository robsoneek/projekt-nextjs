"use client";

import { useState, useEffect } from "react";

type Props = {
  currentStep: number;
  customSounds: { name: string; url: string }[];
  trackUrls: string[];
  setTrackUrls: (urls: string[]) => void;
  grid: boolean[][];
  toggleStep: (trackIndex: number, stepIndex: number) => void;
  onAddTrack: () => void;
};

export default function Sequencer({
  currentStep,
  customSounds,
  trackUrls,
  setTrackUrls,
  grid,
  toggleStep,
  onAddTrack,
}: Props) {
  const [volumes, setVolumes] = useState<number[]>([1, 1, 1, 1]);
  const [mutes, setMutes] = useState<boolean[]>([false, false, false, false]);
  const handleAddNewRow = () => {
    setVolumes((prev) => [...prev, 1]);
    setMutes((prev) => [...prev, false]);
    onAddTrack();
  };
  useEffect(() => {
    grid.forEach((row, trackIndex) => {
      const isActive = row[currentStep];
      const soundUrl = trackUrls[trackIndex];

      if (isActive && soundUrl) {
        const audio = new Audio(soundUrl);
        audio.volume = mutes[trackIndex] ? 0 : volumes[trackIndex];
        audio
          .play()
          .catch((err) => console.log("Waiting for user interaction..."));
      }
    });
  }, [currentStep]);

  return (
    <div className="p-8 bg-zinc-900 rounded-xl w-full overflow-x-auto">
      <div className="flex flex-col gap-4 min-w-max">
        {grid.map((row, trackIndex) => (
          <div key={trackIndex} className="flex items-center gap-6 mb-2 w-full">
            <div className="flex items-center gap-2 shrink-0">
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

              <button
                onClick={() => {
                  const newMutes = [...mutes];
                  newMutes[trackIndex] = !newMutes[trackIndex];
                  setMutes(newMutes);
                }}
                className={`
                text-xs font-bold px-2 py-1 rounded border transition-colors w-16
                ${
                  mutes[trackIndex]
                    ? "bg-red-500/20 text-red-500 border-red-500"
                    : "bg-zinc-800 text-zinc-400 border-zinc-700 hover:text-white"
                }
              `}
              >
                {mutes[trackIndex] ? "Muted" : "Mute"}
              </button>

              <input
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={volumes[trackIndex]}
                onChange={(e) => {
                  const newVolumes = [...volumes];
                  newVolumes[trackIndex] = Number(e.target.value);
                  setVolumes(newVolumes);
                }}
                className="w-20 accent-orange-500 cursor-pointer"
              />
            </div>
            <div className="flex gap-1 shrink-0 ml-4">
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
        <button
          onClick={handleAddNewRow}
          className="mt-2 w-full py-3 rounded-lg border-2 border-dashed border-zinc-700 text-zinc-500 font-bold hover:border-orange-500 hover:text-orange-500 hover:bg-orange-500/10 transition-all flex items-center justify-center gap-2"
        >
          <span className="text-xl leading-none">+</span> ADD TRACK
        </button>
      </div>
    </div>
  );
}
