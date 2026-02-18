'use client';

import { useState } from 'react';
import { storage, db } from '@/app/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { collection, addDoc } from 'firebase/firestore';

export default function Uploader() {
  const [isUploading, setIsUploading] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);

    try {
      const storageRef = ref(storage, `sounds/${file.name}`);

      await uploadBytes(storageRef, file);

      const downloadURL = await getDownloadURL(storageRef);
      console.log("Audio live at:", downloadURL);

      await addDoc(collection(db, "customSounds"), {
        name: file.name,
        url: downloadURL,
        uploadedAt: new Date(),
      });

      alert("Sound successfully saved to the cloud!");
    } catch (error) {
      console.error("Upload Error:", error);
      alert("Something went wrong. Check your console.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="p-6 bg-zinc-900 rounded-xl border border-zinc-800 text-white max-w-sm mx-auto mt-8">
      <h3 className="font-bold mb-4">Upload Sound</h3>
      
      <input 
        type="file" 
        accept="audio/wav, audio/mpeg" 
        onChange={handleFileUpload}
        disabled={isUploading}
        className="block w-full text-sm text-zinc-400
          file:mr-4 file:py-2 file:px-4
          file:rounded file:border-0
          file:text-sm file:font-bold
          file:bg-orange-500 file:text-white
          hover:file:bg-orange-600 cursor-pointer disabled:opacity-50"
      />
      
      {isUploading && <p className="text-orange-400 text-sm mt-3 animate-pulse">Uploading to cloud...</p>}
    </div>
  );
}