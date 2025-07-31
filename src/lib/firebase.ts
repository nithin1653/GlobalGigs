// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase, ref, get } from "firebase/database";
import { db, Freelancer, Conversation } from '@/lib/mock-data';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDA8a_whDDg-4xrsD9ruCj725aJKxwquwE",
  authDomain: "globalgigs.firebaseapp.com",
  databaseURL: "https://globalgigs-default-rtdb.firebaseio.com",
  projectId: "globalgigs",
  storageBucket: "globalgigs.firebasestorage.app",
  messagingSenderId: "670117679270",
  appId: "1:670117679270:web:2baa0d03746a2ace502467"
};

// Initialize Firebase
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);
const database = getDatabase(app);

// Functions to get data (currently from mock, but prepared for firebase)
export async function getFreelancers(): Promise<Freelancer[]> {
  // This is where you would fetch from Firebase's Realtime Database
  // For now, we return the mock data
  return Promise.resolve(db.freelancers);
}

export async function getFreelancerById(id: string): Promise<Freelancer | undefined> {
  // This is where you would fetch from Firebase's Realtime Database
  const freelancers = await getFreelancers();
  return Promise.resolve(freelancers.find(f => f.id === id));
}

export async function getConversations(): Promise<Conversation[]> {
    // This is where you would fetch from Firebase's Realtime Database
    return Promise.resolve(db.conversations);
}

export { app, auth, database };
