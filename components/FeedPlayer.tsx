"use client";
import { useState, useEffect, useRef } from "react";

export default function MiniPlayer({ beat }: { beat: any }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const stepRef = useRef(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Smart feature: Stop this player if the user clicks play on a DIFFERENT beat
  useEffect(() => {
    const handleGlobalStop = (e: any) => {
      if (e.detail.exceptId !== beat.id) {
        stopPlaying();
      }
    };
    window.addEventListener("stopAllPlayers", handleGlobalStop);
    return () => window.removeEventListener("stopAllPlayers", handleGlobalStop);
  }, [beat.id]);

  // Cleanup timer if the user leaves the page
  useEffect(() => {
    return () => stopPlaying();
  }, []);

  const stopPlaying = () => {
    setIsPlaying(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const togglePlay = () => {
    if (isPlaying) {
      stopPlaying();
    } else {
      // 1. Tell all other mini players on the feed to stop
      window.dispatchEvent(
        new CustomEvent("stopAllPlayers", { detail: { exceptId: beat.id } }),
      );

      // 2. Start this player
      setIsPlaying(true);
      stepRef.current = 0;
      playStep(); // Play the very first note immediately
      timerRef.current = setInterval(playStep, 15000 / (beat.bpm || 120));
    }
  };

  const playStep = () => {
    try {
      // Parse the patterns string from Firebase
      const patterns =
        typeof beat.patterns === "string"
          ? JSON.parse(beat.patterns)
          : beat.patterns;
      if (!patterns || !patterns[0]) return;

      const currentPattern = patterns[0]; // Just loop Pattern A for the preview
      const trackUrls = beat.trackUrls || [];
      const volumes = beat.volumes || trackUrls.map(() => 1);
      const mutes = beat.mutes || trackUrls.map(() => false);

      // Play the sounds for the current step
      trackUrls.forEach((url: string, trackIndex: number) => {
        if (mutes[trackIndex]) return;

        const trackRow = currentPattern[trackIndex];
        if (trackRow && trackRow[stepRef.current]) {
          const audio = new Audio(url);
          audio.volume = volumes[trackIndex] ?? 1;
          audio.play().catch((err) => {
            if (err.name !== "AbortError") console.error(err);
          });
        }
      });

      // Move to next step (0-15 loop)
      stepRef.current = (stepRef.current + 1) % 16;
    } catch (error) {
      console.error("Error playing preview:", error);
      stopPlaying();
    }
  };

  return (
    <button
      onClick={togglePlay}
      title={isPlaying ? "Stop Preview" : "Play Preview"}
      className={`w-10 h-10 flex items-center justify-center rounded-full transition-all shrink-0 border ${
        isPlaying
          ? "bg-orange-500 border-orange-400 text-white shadow-[0_0_15px_rgba(249,115,22,0.4)] animate-pulse"
          : "bg-zinc-800 border-zinc-700 text-zinc-300 hover:bg-zinc-700 hover:text-white"
      }`}
    >
      {/* Play (▶) or Stop (■) Icon */}
      <span className={isPlaying ? "text-sm" : "text-sm ml-1"}>
        {isPlaying ? "■" : "▶"}
      </span>
    </button>
  );
}
