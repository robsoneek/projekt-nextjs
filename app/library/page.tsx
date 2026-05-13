"use client";
import { useEffect, useState } from "react";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "@/app/firebase";
import Link from "next/link";

type SavedBeat = {
  id: string;
  name: string;
  bpm: number;
  createdAt: any;
  patterns: any;
  trackUrls: string[];
};

export default function LibraryPage() {
  const [beats, setBeats] = useState<SavedBeat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchBeats() {
      try {
        const querySnapshot = await getDocs(collection(db, "beats"));

        const beatList = querySnapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            name: data.name || "Untitled Beat",
            bpm: data.bpm,
            createdAt: data.createdAt,
            patterns: data.patterns,
            trackUrls: data.trackUrls || [],
          } as SavedBeat;
        });

        beatList.sort((a, b) => b.createdAt?.seconds - a.createdAt?.seconds);

        setBeats(beatList);
      } catch (error) {
        console.error("Error fetching beats:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchBeats();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center gap-4">
        <div className="w-8 h-8 border-4 border-zinc-800 border-t-orange-500 rounded-full animate-spin"></div>
        <p className="text-zinc-500 font-mono text-sm tracking-widest uppercase">
          Loading Library...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-12 border-b border-zinc-800 pb-6">
          <div>
            <h1 className="text-4xl font-black text-white tracking-tight mb-2">
              Beat Library
            </h1>
            <p className="text-zinc-400">
              Browse and remix all beats saved to the cloud.
            </p>
          </div>
          <Link
            href="/"
            className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-bold transition-colors shadow-lg shadow-orange-500/20"
          >
            + New Beat
          </Link>
        </div>

        {beats.length === 0 ? (
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-12 text-center">
            <h3 className="text-xl font-bold text-white mb-2">
              No beats found
            </h3>
            <p className="text-zinc-500">Go make some noise!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {beats.map((beat) => (
              <div
                key={beat.id}
                className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 hover:border-orange-500 transition-all group flex flex-col"
              >
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-2xl font-bold text-white group-hover:text-orange-400 transition-colors truncate pr-4">
                    {beat.name}
                  </h2>
                  <span className="bg-zinc-950 text-zinc-400 text-xs font-mono px-2 py-1 rounded border border-zinc-800 shrink-0">
                    {beat.bpm} BPM
                  </span>
                </div>

                <div className="text-sm text-zinc-500 mb-8 grow">
                  <p>Tracks: {beat.trackUrls.length}</p>
                  <p>
                    Created:{" "}
                    {beat.createdAt
                      ? new Date(
                          beat.createdAt.seconds * 1000,
                        ).toLocaleDateString()
                      : "Unknown"}
                  </p>
                </div>

                <Link
                  href={`/beat/${beat.id}?from=library`}
                  className="w-full bg-zinc-800 hover:bg-zinc-700 text-white font-bold py-3 rounded text-center transition-colors border border-zinc-700 hover:border-zinc-500"
                >
                  Open in Studio
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
