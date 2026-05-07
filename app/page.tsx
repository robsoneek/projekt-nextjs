"use client";
import StudioUI from "@/components/StudioUI";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center pt-10 bg-black p-4">
      <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-linear-to-r from-orange-400 to-red-600 mb-8">
        BEATS
      </h1>
      <StudioUI />
    </main>
  );
}
