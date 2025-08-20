

export interface PortfolioItem {
  id: number;
  title: string;
  description: string;
  imageUrls: string[];
  technologiesUsed?: string[];
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
  metadata?: {
    type: 'gig-proposal' | 'gig-acceptance';
    proposalId?: string;
  }
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

export interface GigProposal {
  id: string;
  conversationId: string;
  freelancerId: string;
  clientId: string;
  title: string;
  description: string;
  price: number;
  status: 'Pending' | 'Accepted' | 'Declined';
  createdAt: string | object;
  updatedGigId?: string; // To link a proposal to an existing gig for updates
}

export interface Gig {
  id: string;
  title: string;
  description: string;
  price: number;
  status: 'In Progress' | 'Completed' | 'Pending' | 'Pending Update' | 'Cancelled';
  clientId: string;
  freelancerId: string;
  client?: ParticipantInfo;
  freelancer?: ParticipantInfo;
  createdAt: string;
  conversationId?: string;
}
