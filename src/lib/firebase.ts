
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
             console.log(`[Firebase] Created user profile for UID: ${uid}`);
        }
    } catch (error) {
        console.error("[Firebase] Error creating user profile:", error);
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
        console.warn(`[Firebase] No user profile found for UID: ${uid}`);
        return null;
    } catch (error) {
        console.error(`[Firebase] Error fetching user profile for UID ${uid}:`, error);
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
    console.error("[Firebase] Error fetching freelancers:", error);
    return [];
  }
}

export async function getFreelancerById(id: string): Promise<Freelancer | undefined> {
  try {
    const snapshot = await get(child(ref(database, 'freelancers'), id));
    if (snapshot.exists()) {
      return { ...snapshot.val(), id: snapshot.key };
    }
    console.warn(`[Firebase] No freelancer found for ID: ${id}`);
    return undefined;
  } catch (error) {
    console.error(`[Firebase] Error fetching freelancer with ID ${id}:`, error);
    return undefined;
  }
}

export async function updateFreelancerProfile(uid: string, data: Partial<Omit<Freelancer, 'id'>>) {
    try {
        const freelancerRef = ref(database, 'freelancers/' + uid);
        await update(freelancerRef, data);
        console.log(`[Firebase] Updated freelancer profile for UID: ${uid}`);
    } catch (error) {
        console.error(`[Firebase] Error updating freelancer profile for UID ${uid}:`, error);
        throw error;
    }
}

async function getParticipantData(userId: string) {
    let participantProfile = await getUserProfile(userId);
    if (participantProfile?.role === 'freelancer') {
        const freelancerProfile = await getFreelancerById(userId);
        return {
            id: userId,
            name: freelancerProfile?.name || participantProfile?.email || 'User',
            avatarUrl: freelancerProfile?.avatarUrl || '',
            role: freelancerProfile?.role || 'freelancer',
        }
    }
    return {
        id: userId,
        name: participantProfile?.name || participantProfile?.email || 'User',
        avatarUrl: participantProfile?.avatarUrl || '',
        role: participantProfile?.role || 'client',
    }
}


export async function findOrCreateConversation(clientUserId: string, freelancerUserId: string): Promise<Conversation> {
  console.log(`[Firebase] Finding or creating conversation between client ${clientUserId} and freelancer ${freelancerUserId}`);
  const conversationsRef = ref(database, 'conversations');
  const q = query(conversationsRef, orderByChild('clientUserId'), equalTo(clientUserId));
  const snapshot = await get(q);

  let existingConversation: Conversation | null = null;
  if (snapshot.exists()) {
    const convs = snapshot.val();
    const convId = Object.keys(convs).find(key => convs[key].freelancerUserId === freelancerUserId);
    if (convId) {
      console.log(`[Firebase] Found existing conversation: ${convId}`);
      const convData = convs[convId];
      const participantProfile = await getParticipantData(freelancerUserId);
      existingConversation = { ...convData, id: convId, participant: participantProfile };
    }
  }

  if (existingConversation) {
    return existingConversation;
  } else {
    console.log(`[Firebase] No existing conversation found. Creating a new one.`);
    const clientProfile = await getParticipantData(clientUserId);
    const freelancerProfile = await getParticipantData(freelancerUserId);

    if (!freelancerProfile) throw new Error("Freelancer not found");

    const newConversationRef = push(conversationsRef);
    const newConversationData: Omit<Conversation, 'id' | 'participant'> = {
      clientUserId: clientUserId,
      freelancerUserId: freelancerUserId,
      messages: [],
      lastMessage: "Conversation started",
      lastMessageTimestamp: serverTimestamp(),
      client: clientProfile,
      freelancer: freelancerProfile,
    };
    await set(newConversationRef, newConversationData);
    console.log(`[Firebase] Created new conversation: ${newConversationRef.key}`);

    const createdConversation = await get(newConversationRef);
    return { ...createdConversation.val(), id: newConversationRef.key!, participant: freelancerProfile };
  }
}

export async function getConversationsForUser(userId: string, userRole: 'client' | 'freelancer'): Promise<Conversation[]> {
  try {
    console.log(`[Firebase] Getting conversations for user ${userId} as ${userRole}`);
    const conversationsRef = ref(database, 'conversations');
    const userField = userRole === 'client' ? 'clientUserId' : 'freelancerUserId';
    const q = query(conversationsRef, orderByChild(userField), equalTo(userId));
    const snapshot = await get(q);
    
    if (snapshot.exists()) {
      const data = snapshot.val();
      console.log(`[Firebase] Found ${Object.keys(data).length} conversations raw.`);
      const conversations = await Promise.all(Object.keys(data).map(async key => {
        const conv = data[key];
        const otherUserId = userRole === 'client' ? conv.freelancerUserId : conv.clientUserId;
        const participantData = await getParticipantData(otherUserId);
            
        return { 
            ...conv, 
            id: key, 
            participant: participantData
        };
      }));
      // Sort conversations by last message timestamp, newest first
      const sortedConversations = conversations.sort((a, b) => new Date(b.lastMessageTimestamp).getTime() - new Date(a.lastMessageTimestamp).getTime());
      console.log(`[Firebase] Processed and sorted ${sortedConversations.length} conversations.`);
      return sortedConversations;
    }
    console.log(`[Firebase] No conversations found for user ${userId}`);
    return [];
  } catch (error) {
    console.error(`[Firebase] Error fetching conversations for user ${userId}:`, error);
    return [];
  }
}


export async function sendMessage(conversationId: string, message: Message) {
    const messageWithTimestamp = {
        ...message,
        timestamp: serverTimestamp()
    };
    console.log(`[Firebase] Sending message to conversation: ${conversationId}`);
    const conversationRef = ref(database, `conversations/${conversationId}`);
    const messagesRef = ref(database, `conversations/${conversationId}/messages`);
    const newMessageRef = push(messagesRef);
    await set(newMessageRef, messageWithTimestamp);
    await update(conversationRef, {
        lastMessage: message.text,
        lastMessageTimestamp: serverTimestamp()
    });
    console.log(`[Firebase] Message sent to ${conversationId}`);
}

export function subscribeToConversation(conversationId: string, callback: (messages: Message[]) => void) {
    const messagesRef = query(ref(database, `conversations/${conversationId}/messages`), orderByChild('timestamp'));
    console.log(`[Firebase] Subscribing to messages for conversation: ${conversationId}`);
    return onValue(messagesRef, (snapshot) => {
        const messages: Message[] = [];
        if (snapshot.exists()) {
            snapshot.forEach((childSnapshot) => {
                messages.push({ id: childSnapshot.key!, ...childSnapshot.val() });
            });
        }
        console.log(`[Firebase] Subscription update for ${conversationId}: ${messages.length} messages.`);
        callback(messages);
    });
}


export { app, auth, database };
