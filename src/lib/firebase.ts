
// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase, ref, get, child, set, update, query, equalTo, orderByChild, push, serverTimestamp, onValue, Unsubscribe } from "firebase/database";
import type { Freelancer, Conversation, UserProfile, Message, Gig, GigProposal } from '@/lib/mock-data';

// Your web app's Firebase configuration
const firebaseConfig = {
  "projectId": "globalgigs",
  "appId": "1:670117679270:web:62a99c2bf73535b7502467",
  "storageBucket": "globalgigs.firebasestorage.app",
  "apiKey": "AIzaSyDA8a_whDDg-4xrsD9ruCj725aJKxwquwE",
  "authDomain": "globalgigs.firebaseapp.com",
  "measurementId": "",
  "messagingSenderId": "670117679270",
  "databaseURL": "https://globalgigs-default-rtdb.firebaseio.com"
};

// Initialize Firebase
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);
const database = getDatabase(app);

// Function to create user profile in Realtime Database
export async function createUserProfile(uid: string, data: { email: string, name: string, role: 'client' | 'freelancer' }) {
    try {
        const userRef = ref(database, 'users/' + uid);
        const snapshot = await get(userRef);
        if (!snapshot.exists()) {
             await set(userRef, {
                ...data,
                createdAt: new Date().toISOString(),
            });
             console.log(`[Firebase] Created user profile for UID: ${uid}`);

             // If the user is a freelancer, create a basic freelancer profile
             if (data.role === 'freelancer') {
                const freelancerRef = ref(database, 'freelancers/' + uid);
                const freelancerSnapshot = await get(freelancerRef);
                if (!freelancerSnapshot.exists()) {
                    await set(freelancerRef, {
                        uid: uid,
                        name: data.name,
                        email: data.email,
                        role: 'New Freelancer',
                        category: 'Uncategorized',
                        location: 'Not specified',
                        rate: 0,
                        availability: 'Unavailable',
                        skills: [],
                        bio: 'Welcome to GlobalGigs!',
                        avatarUrl: 'https://placehold.co/128x128.png',
                        portfolio: [],
                        experience: [],
                    });
                    console.log(`[Firebase] Created initial freelancer profile for UID: ${uid}`);
                }
             }
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
      return Object.keys(data).map(key => ({ ...data[key], id: key, uid: key }));
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
      return { ...snapshot.val(), id: snapshot.key, uid: snapshot.key };
    }
    console.warn(`[Firebase] No freelancer found for ID: ${id}`);
    return undefined;
  } catch (error) {
    console.error(`[Firebase] Error fetching freelancer with ID ${id}:`, error);
    return undefined;
  }
}

export async function updateUserProfile(uid: string, data: Partial<UserProfile>) {
  try {
      const userRef = ref(database, 'users/' + uid);
      await update(userRef, data);
      console.log(`[Firebase] Updated user profile for UID: ${uid}`);
  } catch (error) {
      console.error(`[Firebase] Error updating user profile for UID ${uid}:`, error);
      throw error;
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

export async function getParticipantData(userId: string) {
    let userProfile = await getUserProfile(userId);
    let freelancerProfile = null;
    if (userProfile?.role === 'freelancer') {
        freelancerProfile = await getFreelancerById(userId);
    }
    
    // Prioritize name from the dedicated user profile, then freelancer profile, then email.
    const name = userProfile?.name || freelancerProfile?.name || userProfile?.email || 'User';
    const avatarUrl = userProfile?.avatarUrl || freelancerProfile?.avatarUrl || '';
    const role = freelancerProfile?.role || userProfile?.role || 'user';
    
    return {
        id: userId,
        name: name,
        avatarUrl: avatarUrl,
        role: role,
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


export async function sendMessage(conversationId: string, message: Omit<Message, 'id'>) {
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

export function subscribeToConversation(conversationId: string, callback: (messages: Message[]) => void): Unsubscribe {
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

// Gig and Proposal Functions
export async function createGigProposal(proposalData: Omit<GigProposal, 'id' | 'status' | 'createdAt'>): Promise<string> {
    const newProposalRef = push(ref(database, 'proposals'));
    const fullProposalData = {
        ...proposalData,
        status: 'Pending',
        createdAt: serverTimestamp(),
    };
    await set(newProposalRef, fullProposalData);
    return newProposalRef.key!;
}

export async function getGigProposalById(proposalId: string): Promise<GigProposal | null> {
    const proposalRef = ref(database, `proposals/${proposalId}`);
    const snapshot = await get(proposalRef);
    if (snapshot.exists()) {
        return { ...snapshot.val(), id: proposalId };
    }
    return null;
}

export function subscribeToGigProposal(proposalId: string, callback: (proposal: GigProposal | null) => void): Unsubscribe {
    const proposalRef = ref(database, `proposals/${proposalId}`);
    return onValue(proposalRef, (snapshot) => {
        if (snapshot.exists()) {
            callback({ ...snapshot.val(), id: proposalId });
        } else {
            callback(null);
        }
    });
}

export async function updateGigProposalStatus(proposalId: string, status: 'Accepted' | 'Declined') {
    const proposalRef = ref(database, `proposals/${proposalId}`);
    await update(proposalRef, { status });
}


export async function acceptGig(gigData: Gig) {
    const newGigRef = push(ref(database, 'gigs'));
    // Find the conversation ID based on client and freelancer
    const conversation = await findOrCreateConversation(gigData.clientId, gigData.freelancerId);

    await set(newGigRef, {
        ...gigData,
        id: newGigRef.key!,
        createdAt: serverTimestamp(),
        conversationId: conversation.id,
    });
}

export async function getGigsForUser(userId: string): Promise<Gig[]> {
    const gigsRef = ref(database, 'gigs');
    const snapshot = await get(gigsRef);
    const allGigs: Gig[] = [];
    if (snapshot.exists()) {
        snapshot.forEach((child) => {
            const gig = { ...child.val(), id: child.key };
            // Ensure we only show gigs relevant to the user
            if (gig.freelancerId === userId || gig.clientId === userId) {
                allGigs.push(gig);
            }
        });
    }
    return allGigs.sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function updateGig(gigId: string, data: Partial<Gig>) {
    const gigRef = ref(database, `gigs/${gigId}`);
    await update(gigRef, data);
}


export { app, auth, database };
