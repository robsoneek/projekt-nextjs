"use client";

import { useState, useEffect } from "react";
import Sequencer from "@/components/Sequencer";
import Auth from "@/components/Auth";
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/app/firebase';
import PlaybackControls from "@/components/PlaybackControls";
import Uploader from "@/components/Uploader";

export default function Home() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [bpm, setBpm] = useState(120);
  const [currentStep, setCurrentStep] = useState(0);
  const [customSounds, setCustomSounds] = useState<{ name: string; url: string }[]>([]);
  const [trackUrls, setTrackUrls] = useState<string[]>(["", "", "", ""]);

  useEffect(() => {
    const fetchSounds = async () => {
      const querySnapshot = await getDocs(collection(db, "customSounds"));
      const soundsList = querySnapshot.docs.map(doc => doc.data() as {name: string, url: string});
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

      <div className="w-full max-w-3xl flex flex-col gap-6">
        <PlaybackControls
          isPlaying={isPlaying}
          onTogglePlay={() => setIsPlaying(!isPlaying)}
          bpm={bpm}
          onBpmChange={setBpm}
        />
        <Sequencer 
          currentStep={currentStep}
          customSounds={customSounds}
          trackUrls={trackUrls}
          setTrackUrls={setTrackUrls}
        />
        <Uploader />
      </div>
    </main>
  );
}
