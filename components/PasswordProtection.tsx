import React, { useState } from 'react';
import Button from './Button';
// FIX: Use namespace import for firebase/auth to resolve named export errors.
import * as firebaseAuth from "firebase/auth";
import { auth } from '../services/firebase';

const PasswordProtection: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLogin, setIsLogin] = useState(true);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (isLogin) {
        // FIX: Use signInWithEmailAndPassword from the firebaseAuth namespace.
        await firebaseAuth.signInWithEmailAndPassword(auth, email, password);
      } else {
        // FIX: Use createUserWithEmailAndPassword from the firebaseAuth namespace.
        await firebaseAuth.createUserWithEmailAndPassword(auth, email, password);
      }
      // onAuthStateChanged in App.tsx will handle the rest.
    } catch (err: any) {
        switch (err.code) {
          case 'auth/wrong-password':
          case 'auth/user-not-found':
          case 'auth/invalid-credential':
            setError('Incorrect email or password. Please try again.');
            break;
          case 'auth/email-already-in-use':
            setError('An account with this email already exists.');
            break;
          case 'auth/weak-password':
            setError('Password should be at least 6 characters.');
            break;
          default:
            setError('Authentication failed. Please try again later.');
            console.error(err);
            break;
        }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-95 flex items-center justify-center z-50">
      <div className="w-full max-w-sm p-8 bg-gray-800 rounded-lg shadow-2xl">
        <h1 className="text-2xl font-bold text-indigo-400 mb-2 text-center">{isLogin ? 'Welcome Back' : 'Create Account'}</h1>
        <p className="text-gray-400 mb-6 text-center">{isLogin ? 'Sign in to your account' : 'Join the team'}</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-gray-700 border border-gray-600 rounded-md p-3 text-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            placeholder="Email Address"
            required
            autoComplete="email"
            aria-label="Email"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-gray-700 border border-gray-600 rounded-md p-3 text-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            placeholder="Password"
            required
            minLength={6}
            autoComplete={isLogin ? "current-password" : "new-password"}
            aria-label="Password"
          />
          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? 'Processing...' : isLogin ? 'Sign In' : 'Sign Up'}
          </Button>
        </form>
        {error && <p className="mt-4 text-red-400 text-sm text-center">{error}</p>}
        <div className="mt-6 text-center">
            <button onClick={() => { setIsLogin(!isLogin); setError(''); }} className="text-sm text-indigo-400 hover:text-indigo-300">
                {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
            </button>
        </div>
      </div>
    </div>
  );
};

export default PasswordProtection;
