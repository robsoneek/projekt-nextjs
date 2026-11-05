// components/CommentSection.tsx
"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth, db } from "@/app/firebase";
import {
  addBeatComment,
  subscribeBeatComments,
  CommentItem,
} from "@/utils/socials";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  FirestoreError,
} from "firebase/firestore";

export default function CommentSection({ beatId }: { beatId: string }) {
  const [user, setUser] = useState<User | null>(null);
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [inputText, setInputText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, setUser);
    return () => unsubAuth();
  }, []);

  useEffect(() => {
    if (!beatId) return;
    const unsubscribe = subscribeBeatComments(beatId, setComments);
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [beatId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !user || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const authorName =
        user.displayName || user.email?.split("@")[0] || "Producer";
      await addBeatComment(beatId, user.uid, authorName, inputText.trim());
      setInputText("");
    } catch (err) {
      console.error("Failed to post comment:", err);
      alert("Failed to post comment");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl p-6 mt-8">
      <h3 className="text-xl font-bold text-white mb-4">
        Comments ({comments.length})
      </h3>

      {/* Comment List */}
      <div className="flex flex-col gap-3 max-h-72 overflow-y-auto mb-6 pr-2">
        {comments.length === 0 ? (
          <p className="text-zinc-500 text-sm py-4 text-center">
            No comments yet. Drop some feedback for this beat!
          </p>
        ) : (
          comments.map((comment) => (
            <div
              key={comment.id}
              className="bg-black/50 border border-zinc-800 p-3 rounded-lg flex flex-col gap-1"
            >
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-orange-400">
                  {comment.authorName}
                </span>
                <span className="text-zinc-500 font-mono">
                  {comment.createdAt
                    ? new Date(
                        comment.createdAt.seconds * 1000,
                      ).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "Just now"}
                </span>
              </div>
              <p className="text-zinc-200 text-sm warp-break-words">
                {comment.text}
              </p>
            </div>
          ))
        )}
      </div>

      {/* Input Box */}
      {user ? (
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            placeholder="Write a comment..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            disabled={isSubmitting}
            className="flex-1 bg-zinc-800 border border-zinc-700 text-white text-sm px-4 py-2.5 rounded-lg outline-none focus:border-orange-500 transition-colors"
          />
          <button
            type="submit"
            disabled={isSubmitting || !inputText.trim()}
            className="bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-bold text-sm px-5 py-2.5 rounded-lg transition-colors"
          >
            {isSubmitting ? "Posting..." : "Post"}
          </button>
        </form>
      ) : (
        <div className="bg-zinc-800/60 border border-zinc-700/50 p-3 rounded-lg text-center">
          <p className="text-zinc-400 text-sm">
            You must be logged in to leave a comment.
          </p>
        </div>
      )}
    </div>
  );
}
