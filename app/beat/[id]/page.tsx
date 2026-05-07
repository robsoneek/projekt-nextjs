"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getBeatFromCloud } from "@/utils/db";
import Link from "next/link";
import StudioUI from "@/components/StudioUI";

export default function SharedBeatPage() {
  const params = useParams();
  const router = useRouter();
  const beatId = params.id as string;

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

  return (
    <main className="flex min-h-screen flex-col items-center pt-10 bg-black p-4">
      <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-linear-to-r from-orange-400 to-red-600 mb-8">
        Shared Beat: {beatData.name}
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
