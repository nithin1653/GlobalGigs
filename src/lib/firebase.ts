
// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase, ref, get, child, set, update, query, equalTo, orderByChild, push, serverTimestamp, onValue } from "firebase/database";
import type { Freelancer, Conversation, UserProfile, Message } from '@/lib/mock-data';

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
        const snapshot = await get(userRef);
        if (!snapshot.exists()) {
             await set(userRef, {
                ...data,
                createdAt: new Date().toISOString(),
            });
        }
    } catch (error) {
        console.error("Error creating user profile:", error);
        throw error;
    }
}

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
    try {
        const userRef = ref(database, 'users/' + uid);
        const snapshot = await get(userRef);
        if (snapshot.exists()) {
            return { ...snapshot.val(), id: uid } as UserProfile;
        }
        return null;
    } catch (error) {
        console.error("Error fetching user profile:", error);
        return null;
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

export async function updateFreelancerProfile(uid: string, data: Partial<Omit<Freelancer, 'id'>>) {
    try {
        const freelancerRef = ref(database, 'freelancers/' + uid);
        await update(freelancerRef, data);
    } catch (error) {
        console.error("Error updating freelancer profile:", error);
        throw error;
    }
}

export async function findOrCreateConversation(clientUserId: string, freelancerUserId: string): Promise<Conversation> {
  const conversationsRef = ref(database, 'conversations');
  // A more efficient way to query would be to use a composite key, but for RTDB's structure, querying one and filtering is a common pattern.
  const q = query(conversationsRef, orderByChild('clientUserId'), equalTo(clientUserId));
  const snapshot = await get(q);

  let existingConversation: Conversation | null = null;
  if (snapshot.exists()) {
    const convs = snapshot.val();
    // Find the specific conversation with the target freelancer
    const convId = Object.keys(convs).find(key => convs[key].freelancerUserId === freelancerUserId);
    if (convId) {
      const convData = convs[convId];
       // Ensure participant data is up-to-date
      const freelancerProfile = await getFreelancerById(freelancerUserId);
      if(freelancerProfile) {
        convData.participant = {
            id: freelancerProfile.id,
            name: freelancerProfile.name,
            avatarUrl: freelancerProfile.avatarUrl,
            role: freelancerProfile.role,
        };
      }
      existingConversation = { ...convData, id: convId };
    }
  }

  if (existingConversation) {
    return existingConversation;
  } else {
    // No existing conversation, so create a new one.
    const freelancerData = await getFreelancerById(freelancerUserId);
    if (!freelancerData) throw new Error("Freelancer not found");

    const newConversationRef = push(conversationsRef);
    const newConversationData: Omit<Conversation, 'id'> = {
      clientUserId: clientUserId,
      freelancerUserId: freelancerUserId,
      messages: [], // Start with no messages
      lastMessage: "Conversation started",
      lastMessageTimestamp: serverTimestamp(),
      // The participant should be the other person in the chat
      participant: { // This will be dynamically set on the client, but we can set a default
         id: freelancerData.id,
         name: freelancerData.name,
         avatarUrl: freelancerData.avatarUrl,
         role: freelancerData.role,
      }
    };
    await set(newConversationRef, newConversationData);

    const createdConversation = await get(newConversationRef);
    return { ...createdConversation.val(), id: newConversationRef.key! };
  }
}

export async function getConversationsForUser(userId: string, userRole: 'client' | 'freelancer'): Promise<Conversation[]> {
  try {
    const conversationsRef = ref(database, 'conversations');
    const userField = userRole === 'client' ? 'clientUserId' : 'freelancerUserId';
    const q = query(conversationsRef, orderByChild(userField), equalTo(userId));
    const snapshot = await get(q);
    
    if (snapshot.exists()) {
      const data = snapshot.val();
      const conversations = await Promise.all(Object.keys(data).map(async key => {
        const conv = data[key];
        // Determine the ID of the other participant
        const otherUserId = userRole === 'client' ? conv.freelancerUserId : conv.clientUserId;
        
        // Fetch the other participant's profile for up-to-date info
        // Note: In a real app, you might have a single 'users' node to simplify this.
        const otherUser = userRole === 'client' 
            ? await getFreelancerById(otherUserId) 
            : await getUserProfile(otherUserId);
            
        return { 
            ...conv, 
            id: key, 
            participant: { // ensure participant is the OTHER person in the chat
                id: otherUserId,
                name: otherUser?.name || otherUser?.email || 'User',
                avatarUrl: otherUser?.avatarUrl || '',
                role: otherUser?.role || 'User'
            }
        };
      }));
      // Sort conversations by last message timestamp, newest first
      return conversations.sort((a, b) => new Date(b.lastMessageTimestamp).getTime() - new Date(a.lastMessageTimestamp).getTime());
    }
    return [];
  } catch (error) {
    console.error("Error fetching conversations:", error);
    return [];
  }
}


export async function sendMessage(conversationId: string, message: Message) {
    const messageWithTimestamp = {
        ...message,
        timestamp: serverTimestamp()
    };
    const conversationRef = ref(database, `conversations/${conversationId}`);
    const messagesRef = ref(database, `conversations/${conversationId}/messages`);
    const newMessageRef = push(messagesRef);
    await set(newMessageRef, messageWithTimestamp);
    await update(conversationRef, {
        lastMessage: message.text,
        lastMessageTimestamp: serverTimestamp()
    });
}

export function subscribeToConversation(conversationId: string, callback: (messages: Message[]) => void) {
    const messagesRef = query(ref(database, `conversations/${conversationId}/messages`), orderByChild('timestamp'));
    return onValue(messagesRef, (snapshot) => {
        const messages: Message[] = [];
        if (snapshot.exists()) {
            snapshot.forEach((childSnapshot) => {
                messages.push({ id: childSnapshot.key!, ...childSnapshot.val() });
            });
        }
        callback(messages);
    });
}


export { app, auth, database };
