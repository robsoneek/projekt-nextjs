"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { getBeatFromCloud } from "@/utils/db";
import Link from "next/link";
import StudioUI from "@/components/StudioUI";

export default function SharedBeatPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const beatId = params.id as string;

  const isFromLibrary = searchParams.get("from") === "library";

  const [beatData, setBeatData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadBeat() {
      if (!beatId) return;

      const data = await getBeatFromCloud(beatId);
      if (data) {
        setBeatData(data);
      }
      setLoading(false);
    }

    loadBeat();
  }, [beatId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center gap-4">
        <div className="w-8 h-8 border-4 border-zinc-800 border-t-orange-500 rounded-full animate-spin"></div>
        <p className="text-zinc-500 font-mono text-sm tracking-widest uppercase">
          Loading...
        </p>
      </div>
    );
  }

  if (!beatData) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center gap-4">
        <h1 className="text-white text-2xl font-bold">Beat not found</h1>
        <p className="text-zinc-500">This link might be broken or expired.</p>
        <Link href="/" className="text-orange-500 hover:underline">
          Go back to Studio
        </Link>
      </div>
    );
  }

  if (isFromLibrary) {
    return (
      <main className="flex min-h-screen flex-col items-center pt-10 bg-black p-4">
        <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-linear-to-r from-orange-400 to-red-600 mb-8">
          BEATS
        </h1>
        <div className="w-full mt-8">
          <StudioUI
            initialBeatName={beatData.name}
            initialBpm={beatData.bpm}
            initialPatterns={beatData.patterns}
            initialTrackUrls={beatData.trackUrls}
            initialVolumes={beatData.volumes}
            initialMutes={beatData.mutes}
          />
        </div>
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-black p-8 flex flex-col items-center">
      <div className="max-w-5xl w-full bg-zinc-900 border border-zinc-800 p-8 rounded-2xl shadow-2xl">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h1 className="text-3xl font-black text-white">
              Shared Beat: {beatData.name}
            </h1>
            <p className="text-zinc-400 font-mono text-sm">
              Created:{" "}
              {new Date(beatData.createdAt.seconds * 1000).toLocaleDateString()}
            </p>
          </div>
          <Link
            href="/"
            className="bg-zinc-800 hover:bg-zinc-700 text-white px-4 py-2 rounded text-sm font-bold transition-colors"
          >
            Create Your Own
          </Link>
        </div>

        <div className="mt-8">
          <StudioUI
            initialBeatName={beatData.name}
            initialBpm={beatData.bpm}
            initialPatterns={beatData.patterns}
            initialTrackUrls={beatData.trackUrls}
            initialVolumes={beatData.volumes}
            initialMutes={beatData.mutes}
          />
        </div>
      </div>
    </div>
  );
}
