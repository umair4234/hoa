// FIX: The `initializeApp` function must be imported as a named export from 'firebase/app'.
// The previous namespace import (`import * as firebaseApp from "firebase/app"`) was incorrect for this specific module,
// even though other firebase modules in this project may require it due to the environment setup.
import { initializeApp } from "firebase/app";
// FIX: Use namespace import for firebase/auth to resolve named export error for getAuth.
import * as firebaseAuth from "firebase/auth";
import * as firestore from "firebase/firestore";

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
// FIX: Call the directly imported `initializeApp` function, as the namespace import did not expose it correctly.
const app = initializeApp(firebaseConfig);

// Export the services you'll need in your components
// FIX: Use getAuth from the firebaseAuth namespace.
export const auth = firebaseAuth.getAuth(app);
// FIX: Changed from a named import to a namespace import for consistency and to prevent potential similar errors.
export const db = firestore.getFirestore(app);