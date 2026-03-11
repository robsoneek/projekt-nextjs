"use client";

import { useState, useEffect } from "react";
import Sequencer from "@/components/Sequencer";
import Auth from "@/components/Auth";
import { collection, getDocs, addDoc } from "firebase/firestore";
import { db } from "@/app/firebase";
import PlaybackControls from "@/components/PlaybackControls";
import Uploader from "@/components/Uploader";

export default function Home() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [bpm, setBpm] = useState(120);
  const [currentStep, setCurrentStep] = useState(0);
  const [customSounds, setCustomSounds] = useState<
    { name: string; url: string }[]
  >([]);
  const [trackUrls, setTrackUrls] = useState<string[]>(["", "", "", ""]);
  const [grid, setGrid] = useState(() =>
    new Array(4).fill(null).map(() => Array(16).fill(false)),
  );
  const [beatName, setBeatName] = useState("");
  const [isBrowserOpen, setIsBrowserOpen] = useState(false);
  const [savedBeats, setSavedBeats] = useState<any[]>([]);

  const handleOpenBrowser = async () => {
    setIsBrowserOpen(true);
    try {
      const querySnapshot = await getDocs(collection(db, "beats"));
      const beatList = querySnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          grid:
            typeof data.grid === "string" ? JSON.parse(data.grid) : data.grid,
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
      grid: grid,
      trackUrls: trackUrls,
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
  };

  const handleLoadBeat = (beat: any) => {
    setBpm(beat.bpm);
    setGrid(JSON.parse(beat.grid));
    setTrackUrls(beat.trackUrls);
    setIsBrowserOpen(false);
  };

  const handleClearGrid = () => {
    setGrid(new Array(4).fill(null).map(() => Array(16).fill(false)));
  };

  const handleAddTrack = () => {
    setGrid((prevGrid) => [...prevGrid, Array(16).fill(false)]);
    setTrackUrls((prevUrls) => [...prevUrls, ""]);
  };

  const toggleStep = (trackIndex: number, stepIndex: number) => {
    const newGrid = [...grid];
    newGrid[trackIndex] = [...newGrid[trackIndex]];
    newGrid[trackIndex][stepIndex] = !newGrid[trackIndex][stepIndex];
    setGrid(newGrid);
  };

  useEffect(() => {
    const fetchSounds = async () => {
      const querySnapshot = await getDocs(collection(db, "customSounds"));
      const soundsList = querySnapshot.docs.map(
        (doc) => doc.data() as { name: string; url: string },
      );
      setCustomSounds(soundsList);
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
        <Sequencer
          currentStep={currentStep}
          customSounds={customSounds}
          trackUrls={trackUrls}
          setTrackUrls={setTrackUrls}
          grid={grid}
          toggleStep={toggleStep}
          onAddTrack={handleAddTrack}
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
