// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase, ref, get, child, set } from "firebase/database";
import { Freelancer, Conversation } from '@/lib/mock-data';

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

// Function to create user profile in Realtime Database
export async function createUserProfile(uid: string, data: { email: string, role: 'client' | 'freelancer' }) {
    try {
        const userRef = ref(database, 'users/' + uid);
        return await set(userRef, {
            ...data,
            createdAt: new Date().toISOString(),
        });
    } catch (error) {
        console.error("Error creating user profile:", error);
        throw error;
    }
}

// Functions to get data from Firebase Realtime Database
export async function getFreelancers(): Promise<Freelancer[]> {
  try {
    const snapshot = await get(ref(database, 'freelancers'));
    if (snapshot.exists()) {
      const data = snapshot.val();
      // Firebase returns an object, so we convert it to an array
      return Object.keys(data).map(key => ({ ...data[key], id: key }));
    }
    return [];
  } catch (error) {
    console.error("Error fetching freelancers:", error);
    return [];
  }
}

export async function getFreelancerById(id: string): Promise<Freelancer | undefined> {
  try {
    const snapshot = await get(child(ref(database, 'freelancers'), id));
    if (snapshot.exists()) {
      return { ...snapshot.val(), id: snapshot.key };
    }
    return undefined;
  } catch (error) {
    console.error(`Error fetching freelancer with ID ${id}:`, error);
    return undefined;
  }
}

export async function getConversations(): Promise<Conversation[]> {
    try {
    const snapshot = await get(ref(database, 'conversations'));
    if (snapshot.exists()) {
      const data = snapshot.val();
      return Object.keys(data).map(key => ({ ...data[key], id: key }));
    }
    return [];
  } catch (error) {
    console.error("Error fetching conversations:", error);
    return [];
  }
}

export { app, auth, database };
