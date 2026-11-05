"use client";

import { useState, useEffect } from "react";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { db } from "@/app/firebase";
import Link from "next/link";

type CustomSound = {
  id: string;
  name: string;
  url: string;
};

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("audio");
  const [customSounds, setCustomSounds] = useState<CustomSound[]>([]);
  const [loading, setLoading] = useState(true);
  const [defaultBpm, setDefaultBpm] = useState(120);

  useEffect(() => {
    const fetchCustomSounds = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "customSounds"));
        const soundsList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as CustomSound[];
        setCustomSounds(soundsList);
      } catch (error) {
        console.error("Error fetching custom sounds:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCustomSounds();
  }, []);

  const handleDeleteSound = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this sound?")) return;

    try {
      await deleteDoc(doc(db, "customSounds", id));
      setCustomSounds((prev) => prev.filter((sound) => sound.id !== id));
    } catch (error) {
      console.error("Error deleting sound:", error);
      alert("Error deleting sound.");
    }
  };

  const saveGeneralSettings = () => {
    // Here you could save the default BPM to localStorage or user's DB doc
    alert("Settings saved!");
  };

  return (
    <div className="min-h-screen bg-black p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8 border-b border-zinc-800 pb-6">
          <div>
            <h1 className="text-3xl font-black text-white tracking-tight">
              Settings
            </h1>
            <p className="text-zinc-400 mt-1">
              Customize your studio and manage uploaded samples.
            </p>
          </div>
          <Link
            href="/"
            className="bg-zinc-900 hover:bg-zinc-800 text-white px-4 py-2 rounded-lg border border-zinc-800 transition-colors text-sm font-bold"
          >
            Back to Studio
          </Link>
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          <div className="w-full md:w-64 flex flex-col gap-2 shrink-0">
            <button
              onClick={() => setActiveTab("audio")}
              className={`text-left px-4 py-3 rounded-lg font-bold transition-all ${activeTab === "audio" ? "bg-zinc-800 text-orange-500 border border-zinc-700" : "text-zinc-400 hover:bg-zinc-900 hover:text-white"}`}
            >
              Audio & Samples
            </button>
            <button
              onClick={() => setActiveTab("general")}
              className={`text-left px-4 py-3 rounded-lg font-bold transition-all ${activeTab === "general" ? "bg-zinc-800 text-orange-500 border border-zinc-700" : "text-zinc-400 hover:bg-zinc-900 hover:text-white"}`}
            >
              General
            </button>
          </div>

          <div className="flex-1 bg-zinc-900 border border-zinc-800 rounded-2xl p-8 shadow-2xl">
            {activeTab === "audio" && (
              <div>
                <h2 className="text-xl font-bold text-white mb-6">
                  Manage Your Samples
                </h2>
                <p className="text-zinc-400 text-sm mb-6">
                  Here you can see all the sounds you have uploaded via the
                  Uploader. You can delete them so they do not clutter your
                  menu.
                </p>

                {loading ? (
                  <div className="text-zinc-500 animate-pulse font-mono">
                    Loading samples...
                  </div>
                ) : customSounds.length === 0 ? (
                  <div className="bg-black/50 border border-zinc-800 p-6 rounded-lg text-center text-zinc-500">
                    You haven't uploaded any custom sounds yet.
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    {customSounds.map((sound) => (
                      <div
                        key={sound.id}
                        className="flex justify-between items-center bg-black/40 border border-zinc-800 p-4 rounded-lg hover:border-zinc-600 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => {
                              const a = new Audio(sound.url);
                              a.play().catch((err) => {
                                if (err.name !== "AbortError")
                                  console.error(err);
                              });
                            }}
                            className="w-8 h-8 bg-zinc-800 hover:bg-orange-500 rounded flex items-center justify-center text-white transition-colors"
                            title="Play"
                          >
                            ▶
                          </button>
                          <span className="text-zinc-300 font-medium">
                            {sound.name}
                          </span>
                        </div>
                        <button
                          onClick={() => handleDeleteSound(sound.id)}
                          className="text-xs font-bold text-red-500 hover:text-white hover:bg-red-500 px-3 py-1.5 rounded border border-red-500/30 transition-colors"
                        >
                          DELETE
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === "general" && (
              <div className="flex flex-col gap-6">
                <h2 className="text-xl font-bold text-white">
                  General Settings
                </h2>

                <div>
                  <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider block mb-2">
                    Default BPM on startup
                  </label>
                  <input
                    type="number"
                    value={defaultBpm}
                    onChange={(e) => setDefaultBpm(Number(e.target.value))}
                    className="w-full md:w-1/3 bg-black border border-zinc-800 text-white px-4 py-3 rounded-lg focus:outline-none focus:border-orange-500 transition-colors"
                  />
                </div>

                <div className="pt-4 border-t border-zinc-800">
                  <button
                    onClick={saveGeneralSettings}
                    className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-6 rounded-lg transition-colors"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
