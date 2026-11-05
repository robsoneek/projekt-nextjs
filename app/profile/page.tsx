"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/app/firebase";

export default function MyProfileRedirect() {
  const router = useRouter();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user) {
        router.push(`/profile/${user.uid}`);
      } else {
        router.push("/");
      }
    });
    return () => unsub();
  }, [router]);

  return <div className="min-h-screen bg-black"></div>;
}
