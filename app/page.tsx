"use client";

//TODO implementovat prihlaseni a udelat stranku s profilem

import { useState, useEffect } from "react";
import Sequencer from "@/components/Sequencer";
import Auth from "@/components/Auth";
import { collection, getDocs, addDoc } from "firebase/firestore";
import { db } from "@/app/firebase";
import PlaybackControls from "@/components/PlaybackControls";
import Uploader from "@/components/Uploader";
import { create } from "domain";
import { exportBeatToWav } from "@/utils/audioExport";

const DEFAULT_SOUNDS = [
  { name: "Kick", url: "/sounds/KICK - my favorite.wav" },
  { name: "Snare", url: "/sounds/SNARE - r.i.p..wav" },
  { name: "Hat", url: "/sounds/HAT - basic.wav" },
  { name: "Clap", url: "/sounds/CLAP - basic.wav" },
];

export default function Home() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [bpm, setBpm] = useState(140);
  const [currentStep, setCurrentStep] = useState(0);
  const [customSounds, setCustomSounds] =
    useState<{ name: string; url: string }[]>(DEFAULT_SOUNDS);
  const [trackUrls, setTrackUrls] = useState<string[]>(
    DEFAULT_SOUNDS.map((s) => s.url),
  );
  const createBlankGrid = (numTracks = 4) =>
    new Array(numTracks).fill(null).map(() => Array(16).fill(false));
  const [patterns, setPatterns] = useState([
    createBlankGrid(),
    createBlankGrid(),
    createBlankGrid(),
    createBlankGrid(),
  ]);
  const [activePattern, setActivePattern] = useState(0);
  const currentGrid = patterns[activePattern];
  const [beatName, setBeatName] = useState("");
  const [isBrowserOpen, setIsBrowserOpen] = useState(false);
  const [savedBeats, setSavedBeats] = useState<any[]>([]);
  const [volumes, setVolumes] = useState<number[]>([1, 1, 1, 1]);
  const [mutes, setMutes] = useState<boolean[]>([false, false, false, false]);

  const handleOpenBrowser = async () => {
    setIsBrowserOpen(true);
    try {
      const querySnapshot = await getDocs(collection(db, "beats"));
      const beatList = querySnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          patterns: data.patterns
            ? typeof data.patterns === "string"
              ? JSON.parse(data.patterns)
              : data.patterns
            : null,
          grid: data.grid
            ? typeof data.grid === "string"
              ? JSON.parse(data.grid)
              : data.grid
            : null,
        };
      });
      setSavedBeats(beatList);
    } catch (error) {
      console.error("Error fetching beats: ", error);
    }
  };

  const handleSaveBeat = async () => {
    if (!beatName.trim()) {
      alert("Name your beat first!");
    }
    const beatData = {
      name: beatName,
      bpm: bpm,
      patterns: JSON.stringify(patterns),
      trackUrls: trackUrls,
      volumes: volumes,
      mutes: mutes,
      createdAt: new Date(),
    };

    try {
      await addDoc(collection(db, "beats"), beatData);
      alert("Beat saved to the cloud succesfully!");
      setBeatName("");
    } catch (error) {
      console.error("Error saving beat: ", error);
      alert("Failed to save beat");
    }
    handleClearGrid();
  };

  const handleLoadBeat = (beat: any) => {
    setBpm(beat.bpm);
    setTrackUrls(beat.trackUrls);

    if (beat.patterns) {
      setPatterns(beat.patterns);
      setVolumes(beat.volumes || Array(beat.patterns.length).fill(1));
      setMutes(beat.mutes || Array(beat.patterns.length).fill(false));
    } else if (beat.grid) {
      setPatterns([
        beat.grid,
        createBlankGrid(beat.grid.length),
        createBlankGrid(beat.grid.length),
        createBlankGrid(beat.grid.length),
      ]);
      setVolumes(beat.volumes || Array(beat.grid.length).fill(1));
      setMutes(beat.mutes || Array(beat.grid.length).fill(false));
    }

    setIsBrowserOpen(false);
  };

  const handleClearGrid = () => {
    setPatterns((prevPatterns) => {
      const newPatterns = [...prevPatterns];
      newPatterns[activePattern] = createBlankGrid(
        newPatterns[activePattern].length,
      );
      return newPatterns;
    });
  };

  const handleAddTrack = () => {
    setPatterns((prevPatterns) =>
      prevPatterns.map((grid) => [...grid, Array(16).fill(false)]),
    );
    setTrackUrls((prevUrls) => [...prevUrls, DEFAULT_SOUNDS[0].url]);
    setVolumes((prev) => [...prev, 1]);
    setMutes((prev) => [...prev, false]);
  };

  const toggleStep = (trackIndex: number, stepIndex: number) => {
    setPatterns((prevPatterns) => {
      const newPatterns = [...prevPatterns];
      const newGrid = [...newPatterns[activePattern]];
      const newRow = [...newGrid[trackIndex]];
      newRow[stepIndex] = !newRow[stepIndex];
      newGrid[trackIndex] = newRow;
      newPatterns[activePattern] = newGrid;

      return newPatterns;
    });
  };

  useEffect(() => {
    const fetchSounds = async () => {
      const querySnapshot = await getDocs(collection(db, "customSounds"));
      const soundsList = querySnapshot.docs.map(
        (doc) => doc.data() as { name: string; url: string },
      );
      setCustomSounds([...DEFAULT_SOUNDS, ...soundsList]);
    };

    fetchSounds();
  }, []);

  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (isPlaying) {
      const msPerStep = 15000 / bpm;
      timer = setInterval(() => {
        setCurrentStep((prev) => (prev + 1) % 16);
      }, msPerStep);
    }
    return () => clearInterval(timer);
  }, [isPlaying, bpm]);
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-black p-4">
      <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-linear-to-r from-orange-400 to-red-600 mb-8">
        BEATS
      </h1>
      <div className="flex gap-2 items-center bg-zinc-900 p-4 rounded-xl border border-zinc-800">
        <input
          type="text"
          placeholder="Name your beat..."
          value={beatName}
          onChange={(e) => setBeatName(e.target.value)}
          className="bg-zinc-800 text-white px-3 py-2 rounded border border-zinc-700 outline-none focus:border-orange-500"
        />
        <button
          onClick={handleSaveBeat}
          className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-4 py-2 rounded transition-colors"
        >
          Save
        </button>
        <button
          onClick={handleOpenBrowser}
          className="bg-zinc-700 hover:bg-zinc-600 text-white font-bold px-4 py-2 rounded transition-colors ml-4"
        >
          Browse Beats
        </button>
      </div>

      <div className="w-full max-w-5xl flex flex-col gap-6">
        <PlaybackControls
          isPlaying={isPlaying}
          onTogglePlay={() => setIsPlaying(!isPlaying)}
          bpm={bpm}
          onBpmChange={setBpm}
          onClear={handleClearGrid}
        />
        <div className="flex gap-2 items-center bg-zinc-900 p-2 rounded-xl border border-zinc-800 w-fit">
          <span className="text-zinc-500 font-bold text-xs px-2 tracking-widest uppercase">
            Pattern
          </span>
          {["A", "B", "C", "D"].map((letter, index) => (
            <button
              key={letter}
              onClick={() => setActivePattern(index)}
              className={`
        w-10 h-10 font-bold rounded transition-all
        ${
          activePattern === index
            ? "bg-orange-500 text-white shadow-[0_0_15px_rgba(249,115,22,0.5)]"
            : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white"
        }
      `}
            >
              {letter}
            </button>
          ))}
        </div>
        <button
          onClick={() =>
            exportBeatToWav(
              patterns,
              activePattern,
              trackUrls,
              bpm,
              volumes,
              mutes,
            )
          }
          className="bg-orange-500 text-white px-4 py-2 rounded font-bold"
        >
          Test Export Setup
        </button>
        <Sequencer
          currentStep={currentStep}
          customSounds={customSounds}
          trackUrls={trackUrls}
          setTrackUrls={setTrackUrls}
          grid={currentGrid}
          toggleStep={toggleStep}
          onAddTrack={handleAddTrack}
          volumes={volumes}
          setVolumes={setVolumes}
          mutes={mutes}
          setMutes={setMutes}
        />
        <Uploader />
      </div>
      {isBrowserOpen && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 border border-zinc-700 rounded-xl w-full max-w-md p-6 max-h-[80vh] overflow-y-auto shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">
                Your Beat Library
              </h2>
              <button
                onClick={() => setIsBrowserOpen(false)}
                className="text-zinc-400 hover:text-white font-bold"
              >
                ✕
              </button>
            </div>

            {savedBeats.length === 0 ? (
              <p className="text-zinc-500 text-center py-8">
                Loading beats or no beats saved yet!
              </p>
            ) : (
              <div className="flex flex-col gap-3">
                {savedBeats.map((beat, index) => (
                  <div
                    key={beat.id || index}
                    className="flex justify-between items-center bg-zinc-800 p-4 rounded-lg border border-zinc-700 hover:border-orange-500 transition-colors cursor-pointer"
                    onClick={() => handleLoadBeat(beat)}
                  >
                    <div>
                      <h3 className="text-orange-400 font-bold">{beat.name}</h3>
                      <p className="text-xs text-zinc-500">
                        {beat.bpm} BPM • {beat.grid?.length || 4} Tracks
                      </p>
                    </div>
                    <span className="text-xs font-bold text-zinc-400 bg-zinc-900 px-2 py-1 rounded">
                      LOAD
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
