import { db } from "@/app/firebase";
import {
  doc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  increment,
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
  Timestamp,
  FirestoreError,
} from "firebase/firestore";
import { writeBatch, getDoc, where, getDocs } from "firebase/firestore";

export type CommentItem = {
  id: string;
  authorId: string;
  authorName: string;
  text: string;
  createdAt: Timestamp | null;
};

export async function addBeatComment(beatId: string, authorId: string, authorName: string, text: string) {
  const commentsRef = collection(db, "beats", beatId, "comments");
  await addDoc(commentsRef, {
    authorId,
    authorName,
    text,
    createdAt: serverTimestamp(),
  });
}

// Subscribe to real-time comments for a beat
export function subscribeBeatComments(
  beatId: string, 
  onUpdate: (comments: CommentItem[]) => void
) {
  const commentsRef = collection(db, "beats", beatId, "comments");
  const q = query(commentsRef, orderBy("createdAt", "asc"));

  return onSnapshot(
    q,
    (snapshot) => {
      const comments = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as CommentItem[];
      onUpdate(comments);
    },
    (error: FirestoreError | any) => {
      if (
        error?.name === "AbortError" || 
        error?.code === "cancelled" || 
        error?.message?.includes("aborted")
      ) {
        return;
      }
      console.warn("Snapshot error:", error);
    }
  );
}

export async function toggleLikeBeat(beatId: string, userId: string, hasLiked: boolean) {
  const beatRef = doc(db, "beats", beatId);
  await updateDoc(beatRef, {
    likes: hasLiked ? arrayRemove(userId) : arrayUnion(userId),
    likeCount: increment(hasLiked ? -1 : 1),
  });
}

// --- PROFILES & FOLLOWS ---

// Fetch user's public info (using merge to safely create default stats if missing)
export async function getUserProfile(userId: string) {
  const userRef = doc(db, "users", userId);
  const snap = await getDoc(userRef);
  if (!snap.exists()) return { followerCount: 0, followingCount: 0, displayName: "Producer" };
  return snap.data();
}

// Fetch all beats by a specific user
export async function getUserBeats(userId: string) {
  const q = query(
    collection(db, "beats"), 
    where("authorId", "==", userId)
    // Note: To use orderBy("createdAt") with where(), Firestore requires a composite index.
    // For now, we will sort them in the frontend to avoid index errors.
  );
  const snapshot = await getDocs(q);
  const beats = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
  return beats.sort((a: any, b: any) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
}

// Check if current user is following target user
export async function checkIsFollowing(currentUserId: string, targetUserId: string) {
  const ref = doc(db, "users", currentUserId, "following", targetUserId);
  const snap = await getDoc(ref);
  return snap.exists();
}

// Toggle follow relationship
export async function toggleFollow(currentUserId: string, targetUserId: string, isFollowing: boolean) {
  const batch = writeBatch(db);

  const currentUserRef = doc(db, "users", currentUserId);
  const targetUserRef = doc(db, "users", targetUserId);
  const followingRef = doc(db, "users", currentUserId, "following", targetUserId);
  const followerRef = doc(db, "users", targetUserId, "followers", currentUserId);

  if (isFollowing) {
    batch.delete(followingRef);
    batch.delete(followerRef);
    batch.set(currentUserRef, { followingCount: increment(-1) }, { merge: true });
    batch.set(targetUserRef, { followerCount: increment(-1) }, { merge: true });
  } else {
    batch.set(followingRef, { timestamp: serverTimestamp() });
    batch.set(followerRef, { timestamp: serverTimestamp() });
    batch.set(currentUserRef, { followingCount: increment(1) }, { merge: true });
    batch.set(targetUserRef, { followerCount: increment(1) }, { merge: true });
  }

  await batch.commit();
}

