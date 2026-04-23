"use client";
import { useEffect, useState } from "react";
import { auth } from "@/app/firebase";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import Link from "next/link";

export default function Navbar() {
  const [user, setUser] = useState<User | null>(null);
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);
  return (
    <nav className="w-full bg-zinc-950 border-b border-zinc-800 px-6 py-4 flex items-center justify-between sticky top-0 z-50">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-orange-500 rounded flex items-center justify-center shadow-[0_0_15px_rgba(249,115,22,0.4)]">
          <span className="text-white font-black text-xl leading-none">B</span>
        </div>
        <Link
          href="/"
          className="text-white font-bold text-xl tracking-tight hover:text-orange-400 transition-colors"
        >
          BeatMaker
        </Link>
      </div>

      <div className="hidden md:flex items-center gap-6">
        <Link
          href="/"
          className="text-zinc-400 hover:text-white text-sm font-medium transition-colors"
        >
          Studio
        </Link>
        <Link
          href="/library"
          className="text-zinc-400 hover:text-white text-sm font-medium transition-colors"
        >
          My Beats
        </Link>
        <Link
          href="/settings"
          className="text-zinc-400 hover:text-white text-sm font-medium transition-colors"
        >
          Settings
        </Link>
      </div>

      <div className="flex items-center gap-4">
        {user ? (
          <Link
            href="/profile"
            className="flex items-center gap-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-white text-sm font-bold px-4 py-2 rounded transition-colors"
          >
            <span className="w-5 h-5 bg-orange-500 text-white flex items-center justify-center rounded-full text-[10px]">
              {user.email?.charAt(0).toUpperCase()}
            </span>
            Profile
          </Link>
        ) : (
          <>
            <Link
              href="/login?mode=login"
              className="hidden sm:block text-zinc-400 hover:text-white text-sm font-bold transition-colors"
            >
              Log In
            </Link>
            <Link
              href="/login?mode=signup"
              className="bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold px-4 py-2 rounded transition-colors shadow-lg shadow-orange-500/20"
            >
              Sign Up
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}
