import { db } from "@/app/firebase"; 
import { collection, addDoc } from "firebase/firestore";
import { doc, getDoc } from "firebase/firestore";

type BeatData = {
  creatorId?: string;
  patterns: string; 
  trackUrls: string[];
  bpm: number;
  volumes: number[];
  mutes: boolean[];
  createdAt: Date;
};

export async function saveBeatToCloud(beatData: BeatData) {
  try {
    const beatsCollection = collection(db, "beats");
    
    const docRef = await addDoc(beatsCollection, beatData);
    return docRef.id; 
  } catch (error) {
    console.error("Error saving beat: ", error);
    return null;
  }
}

export async function getBeatFromCloud(beatId: string) {
  try {
    const docRef = doc(db, "beats", beatId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        ...data,
        id: docSnap.id,
        patterns: typeof data.patterns === "string" 
          ? JSON.parse(data.patterns) 
          : data.patterns 
      };
    } else {
      console.log("No such beat found!");
      return null;
    }
  } catch (error) {
    console.error("Error fetching beat:", error);
    return null;
  }
}