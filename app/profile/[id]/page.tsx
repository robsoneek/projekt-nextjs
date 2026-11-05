"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "@/app/firebase";
import { getUserProfile, getUserBeats } from "@/utils/socials";
import Link from "next/link";
import MiniPlayer from "@/components/FeedPlayer";
import LikeButton from "@/components/LikeButton";
import FollowButton from "@/components/FollowButton";

export default function ProfilePage() {
  const { id: profileUserId } = useParams() as { id: string };
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const [profileData, setProfileData] = useState<any>(null);
  const [beats, setBeats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, setCurrentUser);
    return () => unsub();
  }, []);

  useEffect(() => {
    async function loadProfile() {
      if (!profileUserId) return;
      setLoading(true);
      try {
        const [profileRes, beatsRes] = await Promise.all([
          getUserProfile(profileUserId),
          getUserBeats(profileUserId),
        ]);
        setProfileData(profileRes);
        setBeats(beatsRes);
      } catch (err) {
        console.error("Error loading profile:", err);
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, [profileUserId]);

  if (loading)
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-white">
        <div className="w-8 h-8 border-4 border-zinc-800 border-t-orange-500 rounded-full animate-spin"></div>
      </div>
    );

  const displayAuthorName =
    beats[0]?.authorName || profileData?.displayName || "Anonymous Producer";

  return (
    <div className="min-h-screen bg-black text-white p-6 md:p-12">
      <div className="max-w-4xl mx-auto">
        {/* Profile Header */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 mb-8 flex flex-col md:flex-row items-center md:items-start gap-6">
          <div className="w-24 h-24 bg-linear-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center text-4xl font-black shadow-lg">
            {displayAuthorName.charAt(0).toUpperCase()}
          </div>

          <div className="flex-1 text-center md:text-left">
            <h1 className="text-3xl font-black">{displayAuthorName}</h1>

            <div className="flex items-center justify-center md:justify-start gap-6 mt-3 text-sm text-zinc-400 font-mono">
              <div>
                <span className="text-white font-bold text-lg">
                  {beats.length}
                </span>{" "}
                Beats
              </div>
              <div>
                <span className="text-white font-bold text-lg">
                  {profileData?.followerCount || 0}
                </span>{" "}
                Followers
              </div>
              <div>
                <span className="text-white font-bold text-lg">
                  {profileData?.followingCount || 0}
                </span>{" "}
                Following
              </div>
            </div>
          </div>

          <div className="self-center md:self-start mt-4 md:mt-0">
            <FollowButton
              currentUserId={currentUser?.uid}
              targetUserId={profileUserId}
            />
          </div>
        </div>

        {/* User's Beats Feed */}
        <h2 className="text-xl font-bold mb-4 border-b border-zinc-800 pb-2">
          Published Tracks
        </h2>

        {beats.length === 0 ? (
          <p className="text-zinc-500">
            This producer hasn't shared any beats yet.
          </p>
        ) : (
          <div className="flex flex-col gap-4">
            {beats.map((beat) => (
              <div
                key={beat.id}
                className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl flex flex-col md:flex-row justify-between items-center gap-4 hover:border-zinc-700 transition-colors"
              >
                <div className="flex-1 text-center md:text-left">
                  <h3 className="font-bold text-lg">{beat.name}</h3>
                  <p className="text-xs text-zinc-500 font-mono mt-1">
                    {beat.bpm} BPM •{" "}
                    {new Date(
                      beat.createdAt?.seconds * 1000,
                    ).toLocaleDateString()}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <MiniPlayer beat={beat} />
                  <LikeButton
                    beatId={beat.id}
                    userId={currentUser?.uid}
                    initialLikes={beat.likes}
                    initialCount={beat.likeCount}
                  />
                  <Link
                    href={`/beat/${beat.id}`}
                    className="bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs px-4 py-2 rounded-lg"
                  >
                    Studio
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
