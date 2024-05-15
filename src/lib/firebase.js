import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth"
import { getFirestore } from "firebase/firestore"
import { getStorage } from "firebase/storage"

// web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_API_KEY,
  authDomain: "chat-33e70.firebaseapp.com",
  projectId: "chat-33e70",
  storageBucket: "chat-33e70.appspot.com",
  messagingSenderId: "86742015668",
  appId: "1:86742015668:web:4162ca89278043c57c01e1"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth()
export const db = getFirestore()
export const storage = getStorage()

