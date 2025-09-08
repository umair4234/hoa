// FIX: The error "Property 'initializeApp' does not exist" indicates the namespace import is not working as expected.
// Reverting to the standard, documented V9 modular syntax with named imports is the correct way to fix this.
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration from the setup screen
const firebaseConfig = {
  apiKey: "AIzaSyApDDBK28bevi9WfHuK00HHcu9gFkfujBQ",
  authDomain: "team-ai-scriptwriter.firebaseapp.com",
  projectId: "team-ai-scriptwriter",
  storageBucket: "team-ai-scriptwriter.firebasestorage.app",
  messagingSenderId: "254891960420",
  appId: "1:254891960420:web:78540e297fab9bfb085771",
  measurementId: "G-VXZBLMBF4C"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export the services you'll need in your components
export const auth = getAuth(app);
export const db = getFirestore(app);
