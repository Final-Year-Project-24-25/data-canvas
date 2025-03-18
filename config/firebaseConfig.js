// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: "data-canvas-2cdf2.firebaseapp.com",
  projectId: "data-canvas-2cdf2",
  storageBucket: "data-canvas-2cdf2.firebasestorage.app",
  messagingSenderId: "638475815218",
  appId: "1:638475815218:web:777d5b384177f3ee352f2b",
  measurementId: "G-93T93WRD2V"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
const analytics = getAnalytics(app);