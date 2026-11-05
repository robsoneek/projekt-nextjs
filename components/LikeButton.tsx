"use client";
import { useState } from "react";
import { toggleLikeBeat } from "@/utils/socials";

type LikeButtonProps = {
  beatId: string;
  userId?: string;
  initialLikes?: string[];
  initialCount?: number;
};

export default function LikeButton({
  beatId,
  userId,
  initialLikes = [],
  initialCount = 0,
}: LikeButtonProps) {
  const [likes, setLikes] = useState<string[]>(initialLikes);
  const [count, setCount] = useState<number>(initialCount);
  const hasLiked = userId ? likes.includes(userId) : false;

  const handleToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!userId) {
      alert("Please log in to like beats!");
      return;
    }

    setLikes((prev) =>
      hasLiked ? prev.filter((id) => id !== userId) : [...prev, userId],
    );
    setCount((prev) => (hasLiked ? prev - 1 : prev + 1));

    try {
      await toggleLikeBeat(beatId, userId, hasLiked);
    } catch (error) {
      console.error("Failed to toggle like:", error);
      setLikes(initialLikes);
      setCount(initialCount);
    }
  };

  return (
    <button
      onClick={handleToggle}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
        hasLiked
          ? "bg-red-500/10 border-red-500/40 text-red-500"
          : "bg-zinc-800 border-zinc-700 text-zinc-400 hover:text-white hover:border-zinc-500"
      }`}
    >
      <span>{hasLiked ? "❤️" : "🤍"}</span>
      <span>{count}</span>
    </button>
  );
}
