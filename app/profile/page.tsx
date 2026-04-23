"use client";
import Link from "next/link";
import { auth } from "@/app/firebase";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) setUser(currentUser);
      else router.push("/login");
      setLoading(false);
    });
    return () => unsubscribe();
  }, [router]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push("/");
    } catch (error) {
      console.error("Error logging out: ", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-zinc-800 border-t-orange-500 rounded-full animate-spin"></div>
      </div>
    );
  }
  if (!user) return null;

  return (
    <div className="min-h-screen bg-black p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-black text-white tracking-tight">
              Profile
            </h1>
            <p className="text-zinc-400 mt-1">Manage your account and beats.</p>
          </div>
          <Link
            href="/"
            className="bg-zinc-900 hover:bg-zinc-800 text-white px-4 py-2 rounded-lg border border-zinc-800 transition-colors text-sm font-bold"
          >
            Back to Studio
          </Link>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 mb-8 flex items-center gap-6 shadow-2xl">
          <div className="w-20 h-20 bg-orange-500/20 text-orange-500 rounded-full flex items-center justify-center text-3xl font-black border border-orange-500/50 shadow-[0_0_20px_rgba(249,115,22,0.2)]">
            {user.email?.charAt(0).toUpperCase()}
          </div>

          <div>
            <h2 className="text-xl font-bold text-white">{user.email}</h2>
            <p className="text-zinc-500 text-sm font-mono mt-1">
              ID: {user.uid}
            </p>
          </div>
        </div>

        <div className="bg-zinc-900/50 border border-zinc-800/50 rounded-2xl p-6">
          <h3 className="text-white font-bold mb-4">Account Actions</h3>
          <button
            className="bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/50 font-bold px-6 py-3 rounded-lg transition-colors"
            onClick={handleLogout}
          >
            Log Out
          </button>
        </div>
      </div>
    </div>
  );
}
