// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCgqaqAUKtIJvG5ffmCpqwJi-WqX1hehfs",
  authDomain: "bouncemade-23372.firebaseapp.com",
  projectId: "bouncemade-23372",
  storageBucket: "bouncemade-23372.firebasestorage.app",
  messagingSenderId: "430004274611",
  appId: "1:430004274611:web:ce2a3d7472b9f013fd37c6",
  measurementId: "G-1KJSL2NCH4"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);