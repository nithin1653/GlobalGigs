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
  id: string;
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
  timestamp: Date | string; // Allow string to match Firebase Timestamps
}

export interface Conversation {
  id: string;
  clientUserId: string;
  freelancerUserId: string;
  participant: {
    id: string;
    name: string;
    avatarUrl: string;
    role: string;
  };
  messages: Message[];
  lastMessage: string;
  lastMessageTimestamp: Date | string; // Allow string to match Firebase Timestamps
}

export interface UserProfile {
  email: string;
  role: 'client' | 'freelancer';
  createdAt: string;
}
