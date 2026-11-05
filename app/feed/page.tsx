"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { onAuthStateChanged, User } from "firebase/auth";
import { db, auth } from "@/app/firebase";
import Link from "next/link";
import LikeButton from "@/components/LikeButton";
import FeedPlayer from "@/components/FeedPlayer";
import CommentSection from "@/components/CommentSection";

type BeatFeedItem = {
  id: string;
  authorId?: string;
  name?: string;
  authorName?: string;
  bpm: number;
  likeCount?: number;
  likes?: string[];
  trackUrls?: string[];
  createdAt?: any;
};

export default function FeedPage() {
  const [beats, setBeats] = useState<BeatFeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [sortBy, setSortBy] = useState<"latest" | "popular">("latest");
  const [openComments, setOpenComments] = useState<Record<string, boolean>>({});

  const toggleComments = (beatId: string) => {
    setOpenComments((prev) => ({
      ...prev,
      [beatId]: !prev[beatId],
    }));
  };

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, setUser);
    return () => unsub();
  }, []);

  useEffect(() => {
    async function fetchFeed() {
      setLoading(true);
      try {
        const field = sortBy === "popular" ? "likeCount" : "createdAt";
        const q = query(collection(db, "beats"), orderBy(field, "desc"));
        const snapshot = await getDocs(q);

        const loadedBeats = snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            authorId: data.authorId,
            name: data.name || "Untitled Beat",
            authorName: data.authorName || "Anonymous Producer",
            bpm: data.bpm || 140,
            likeCount: typeof data.likeCount === "number" ? data.likeCount : 0,
            likes: Array.isArray(data.likes) ? data.likes : [],
            trackUrls: data.trackUrls || [],
            createdAt: data.createdAt,
            patterns: data.patterns,
            volumes: data.volumes,
            mutes: data.mutes,
          };
        });

        setBeats(loadedBeats);
      } catch (error) {
        console.error("Error loading feed:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchFeed();
  }, [sortBy]);

  return (
    <div className="min-h-screen bg-black text-white p-6 md:p-12">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800 pb-6 mb-8">
          <div>
            <h1 className="text-3xl font-black tracking-tight">
              Community Feed
            </h1>
            <p className="text-zinc-400 text-sm mt-1">
              Discover, play, and like beats made by other producers.
            </p>
          </div>

          <div className="flex bg-zinc-900 border border-zinc-800 rounded-lg p-1 self-start md:self-auto">
            <button
              onClick={() => setSortBy("latest")}
              className={`px-3 py-1.5 rounded-md text-xs font-bold transition-colors ${
                sortBy === "latest"
                  ? "bg-orange-500 text-white"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              Latest
            </button>
            <button
              onClick={() => setSortBy("popular")}
              className={`px-3 py-1.5 rounded-md text-xs font-bold transition-colors ${
                sortBy === "popular"
                  ? "bg-orange-500 text-white"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              Trending
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div className="w-8 h-8 border-4 border-zinc-800 border-t-orange-500 rounded-full animate-spin"></div>
            <p className="text-zinc-500 font-mono text-xs uppercase tracking-widest">
              Loading beats...
            </p>
          </div>
        ) : beats.length === 0 ? (
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-12 text-center text-zinc-500">
            No beats published to the feed yet.
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {
              <div className="flex flex-col gap-4">
                {beats.map((beat) => (
                  <div
                    key={beat.id}
                    className="bg-zinc-900 border border-zinc-800 hover:border-zinc-700 transition-colors p-5 rounded-xl flex flex-col gap-4"
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <Link
                          href={`/beat/${beat.id}`}
                          className="text-lg font-bold text-white hover:text-orange-400 transition-colors truncate block"
                        >
                          {beat.name}
                        </Link>
                        <p className="text-zinc-500 text-xs mt-1 font-mono">
                          By{" "}
                          {beat.authorId && beat.authorId !== "anonymous" ? (
                            <Link
                              href={`/profile/${beat.authorId}`}
                              className="text-zinc-300 font-semibold hover:text-orange-400 hover:underline"
                            >
                              {beat.authorName}
                            </Link>
                          ) : (
                            <span className="text-zinc-300 font-semibold">
                              {beat.authorName}
                            </span>
                          )}{" "}
                          • {beat.bpm} BPM
                        </p>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <FeedPlayer beat={beat} />

                        <LikeButton
                          beatId={beat.id}
                          userId={user?.uid}
                          initialLikes={beat.likes}
                          initialCount={beat.likeCount}
                        />

                        <button
                          onClick={() => toggleComments(beat.id)}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                            openComments[beat.id]
                              ? "bg-orange-500/10 border-orange-500/40 text-orange-500"
                              : "bg-zinc-800 border-zinc-700 text-zinc-400 hover:text-white hover:border-zinc-500"
                          }`}
                        >
                          💬
                        </button>

                        <Link
                          href={`/beat/${beat.id}`}
                          className="bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-white font-bold text-xs px-4 py-2 rounded-lg transition-colors"
                        >
                          Open Studio
                        </Link>
                      </div>
                    </div>

                    {openComments[beat.id] && (
                      <div className="border-t border-zinc-800/80 pt-2 animate-fade-in">
                        <CommentSection beatId={beat.id} />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            }
          </div>
        )}
      </div>
    </div>
  );
}
