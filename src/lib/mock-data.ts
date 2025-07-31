

export interface PortfolioItem {
  id: number;
  title: string;
  description: string;
  imageUrl: string;
  hint?: string;
}

export interface Experience {
  id: number;
  role: string;
  company: string;
  period: string;
  description: string;
}

export interface Freelancer {
  id:string;
  uid?: string; // Add uid to link to auth user
  name: string;
  role: string;
  category: string;
  location: string;
  rate: number;
  availability: 'Full-time' | 'Part-time' | 'Unavailable';
  skills: string[];
  bio: string;
  avatarUrl: string;
  portfolio: PortfolioItem[];
  experience: Experience[];
}

export interface Message {
  id: string;
  senderId: string;
  text: string;
  timestamp: Date | string | object; // Allow object for serverTimestamp
}

export interface ParticipantInfo {
    id: string;
    name: string;
    avatarUrl: string;
    role: string;
}


export interface Conversation {
  id: string;
  clientUserId: string;
  freelancerUserId: string;
  participant: ParticipantInfo;
  messages: Message[];
  lastMessage: string;
  lastMessageTimestamp: Date | string | object; // Allow object for serverTimestamp
  // Optional detailed participant info
  client?: ParticipantInfo;
  freelancer?: ParticipantInfo;
}

export interface UserProfile {
  id: string;
  email: string;
  role: 'client' | 'freelancer';
  createdAt: string;
  name?: string;
  avatarUrl?: string;
}
