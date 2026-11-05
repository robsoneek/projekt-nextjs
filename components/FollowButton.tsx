"use client";
import { useState, useEffect } from "react";
import { toggleFollow, checkIsFollowing } from "@/utils/socials";

export default function FollowButton({
  currentUserId,
  targetUserId,
}: {
  currentUserId?: string;
  targetUserId: string;
}) {
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUserId || currentUserId === targetUserId) {
      setLoading(false);
      return;
    }
    checkIsFollowing(currentUserId, targetUserId).then((res) => {
      setIsFollowing(res);
      setLoading(false);
    });
  }, [currentUserId, targetUserId]);

  const handleToggle = async () => {
    if (!currentUserId) {
      alert("Log in to follow producers!");
      return;
    }

    // Optimistic UI update
    const previousState = isFollowing;
    setIsFollowing(!previousState);

    try {
      await toggleFollow(currentUserId, targetUserId, previousState);
    } catch (error) {
      console.error("Failed to follow:", error);
      setIsFollowing(previousState); // Revert on failure
    }
  };

  if (!currentUserId || currentUserId === targetUserId) return null;

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all border ${
        isFollowing
          ? "bg-transparent border-zinc-600 text-zinc-300 hover:border-red-500/50 hover:text-red-400"
          : "bg-white text-black border-white hover:bg-zinc-200"
      }`}
    >
      {loading ? "..." : isFollowing ? "Following" : "Follow"}
    </button>
  );
}
