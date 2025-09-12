
// FIX: The original v9 modular imports were failing, likely due to a project setup expecting the namespaced (v8) API. Switching to the v9 compatibility library to provide that API and resolve initialization errors.
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';

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
firebase.initializeApp(firebaseConfig);

// Export the services you'll need in your components
export const auth = firebase.auth();
export const db = firebase.firestore();
