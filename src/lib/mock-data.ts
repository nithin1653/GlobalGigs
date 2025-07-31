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

const freelancers: Freelancer[] = [
  {
    id: '1',
    name: 'Priya Sharma',
    role: 'Senior UX/UI Designer',
    category: 'Design',
    location: 'Mumbai, India',
    rate: 5000,
    availability: 'Full-time',
    skills: ['Figma', 'Adobe XD', 'User Research', 'Prototyping', 'Design Systems'],
    bio: 'A passionate UX/UI designer with over 8 years of experience creating intuitive and beautiful digital experiences. I specialize in user-centered design methodologies to solve complex problems.',
    avatarUrl: 'https://placehold.co/128x128.png',
    portfolio: [
      { id: 1, title: 'E-commerce Redesign', description: 'Complete overhaul of a major e-commerce platform.', imageUrl: 'https://placehold.co/600x400.png', hint: 'website design' },
      { id: 2, title: 'Mobile Banking App', description: 'Designed a secure and user-friendly mobile banking application.', imageUrl: 'https://placehold.co/600x400.png', hint: 'mobile app' },
    ],
    experience: [
      { id: 1, role: 'Lead UX Designer', company: 'Digital Solutions Inc.', period: '2019 - Present', description: 'Led the design team for flagship products, mentored junior designers, and established a new design system.' },
      { id: 2, role: 'UI/UX Designer', company: 'Creative Minds Studio', period: '2016 - 2019', description: 'Worked on various client projects, from mobile apps to large-scale web applications.' },
    ],
  },
  {
    id: '2',
    name: 'Rohan Verma',
    role: 'Full-Stack Developer',
    category: 'Development',
    location: 'Bangalore, India',
    rate: 7000,
    availability: 'Part-time',
    skills: ['React', 'Node.js', 'TypeScript', 'PostgreSQL', 'AWS'],
    bio: 'Experienced full-stack developer focused on building scalable and high-performance web applications. I have a strong background in both front-end and back-end technologies.',
    avatarUrl: 'https://placehold.co/128x128.png',
    portfolio: [
        { id: 1, title: 'SaaS Platform for EdTech', description: 'Architected and developed a multi-tenant SaaS application from scratch.', imageUrl: 'https://placehold.co/600x400.png', hint: 'dashboard interface' },
        { id: 2, title: 'Real-time Analytics Dashboard', description: 'Built a dashboard with live data visualization capabilities for a logistics company.', imageUrl: 'https://placehold.co/600x400.png', hint: 'analytics chart' },
    ],
    experience: [
        { id: 1, role: 'Senior Software Engineer', company: 'TechLeap', period: '2018 - 2022', description: 'Developed core features for a data analytics platform using React and Node.js.' },
        { id: 2, role: 'Web Developer', company: 'CodeCraft Solutions', period: '2015 - 2018', description: 'Built and maintained client websites using a variety of technologies.' },
    ],
  },
  {
    id: '3',
    name: 'Aarav Patel',
    role: 'DevOps Engineer',
    category: 'Development',
    location: 'Pune, India',
    rate: 6500,
    availability: 'Full-time',
    skills: ['Kubernetes', 'Docker', 'Terraform', 'CI/CD', 'Python'],
    bio: 'DevOps professional with a knack for automation and infrastructure as code. I help companies build robust and scalable deployment pipelines on cloud platforms.',
    avatarUrl: 'https://placehold.co/128x128.png',
    portfolio: [],
    experience: [
        { id: 1, role: 'DevOps Engineer', company: 'InfraScale', period: '2020 - Present', description: 'Managed cloud infrastructure and CI/CD pipelines for a fast-growing FinTech startup.' },
    ],
  },
  {
    id: '4',
    name: 'Anjali Mehta',
    role: 'Content Strategist',
    category: 'Marketing',
    location: 'Delhi, India',
    rate: 4500,
    availability: 'Full-time',
    skills: ['SEO', 'Content Writing', 'Copywriting', 'Social Media', 'Analytics'],
    bio: 'I help brands tell their stories through compelling content that drives engagement and conversions. Data-driven and creative content strategist with national experience.',
    avatarUrl: 'https://placehold.co/128x128.png',
    portfolio: [
        { id: 1, title: 'Blog Content Strategy', description: 'Developed a content strategy for a D2C brand that increased organic traffic by 200%.', imageUrl: 'https://placehold.co/600x400.png', hint: 'blog article' },
    ],
    experience: [
        { id: 1, role: 'Head of Content', company: 'WordWeavers', period: '2017 - 2021', description: 'Led a team of writers and editors to produce high-quality content for various clients.' },
    ],
  },
  {
    id: '5',
    name: 'Vikram Singh',
    role: 'Graphic Designer',
    category: 'Design',
    location: 'Jaipur, India',
    rate: 5500,
    availability: 'Part-time',
    skills: ['Branding', 'Illustration', 'Adobe Illustrator', 'Adobe Photoshop', 'Typography'],
    bio: 'A visual storyteller creating unique brand identities and illustrations. I bring ideas to life with a strong sense of aesthetics and attention to detail.',
    avatarUrl: 'https://placehold.co/128x128.png',
    portfolio: [
      { id: 1, title: 'Brand Identity for Startup', description: 'Created a full brand guide including logo, color palette, and typography for a local startup.', imageUrl: 'https://placehold.co/600x400.png', hint: 'brand logo' },
      { id: 2, title: 'Illustrated Marketing Materials', description: 'Designed and illustrated a series of posters and social media graphics.', imageUrl: 'https://placehold.co/600x400.png', hint: 'poster design' },
    ],
    experience: [
      { id: 1, role: 'Freelance Graphic Designer', company: 'Self-Employed', period: '2015 - Present', description: 'Worked with a diverse range of clients on branding, illustration, and print design projects.' },
    ],
  },
  {
    id: '6',
    name: 'Fatima Ansari',
    role: 'Mobile App Developer',
    category: 'Development',
    location: 'Hyderabad, India',
    rate: 6000,
    availability: 'Full-time',
    skills: ['Swift', 'Kotlin', 'React Native', 'Firebase', 'REST APIs'],
    bio: 'Dedicated mobile developer with expertise in building native and cross-platform applications for iOS and Android. I focus on clean code and great user experience.',
    avatarUrl: 'https://placehold.co/128x128.png',
    portfolio: [
      { id: 1, title: 'Fitness Tracking App', description: 'Developed a native iOS app for tracking workouts and nutrition.', imageUrl: 'https://placehold.co/600x400.png', hint: 'fitness app' },
      { id: 2, title: 'Social Media App', description: 'Built a cross-platform social media app using React Native for a local community.', imageUrl: 'https://placehold.co/600x400.png', hint: 'social media' },
    ],
    experience: [
      { id: 1, role: 'Senior Mobile Developer', company: 'AppWorks', period: '2019 - 2023', description: 'Led development of several high-profile mobile apps, from concept to launch.' },
      { id: 2, role: 'iOS Developer', company: 'MobileNXT', period: '2016 - 2019', description: 'Focused on developing and maintaining native iOS applications.' },
    ],
  },
];

const conversations: Conversation[] = [
    {
      id: 'conv-1',
      participant: freelancers[0],
      messages: [
        { id: 'msg-1', senderId: 'client-1', text: 'Hi Priya, I was impressed by your portfolio. Are you available for a new project?', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString() },
        { id: 'msg-2', senderId: '1', text: 'Hi there! Thank you. Yes, I have some availability starting next month. What did you have in mind?', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 1).toISOString() },
      ],
      lastMessage: 'Hi there! Thank you. Yes, I have some availability starting next month. What did you have in mind?',
      lastMessageTimestamp: new Date(Date.now() - 1000 * 60 * 60 * 1).toISOString(),
    },
    {
      id: 'conv-2',
      participant: freelancers[1],
      messages: [
        { id: 'msg-3', senderId: '2', text: 'The project is under NDA, but I can share more details once we sign it.', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString() },
      ],
      lastMessage: 'The project is under NDA, but I can share more details once we sign it.',
      lastMessageTimestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
    },
     {
      id: 'conv-3',
      participant: freelancers[3],
      messages: [
        { id: 'msg-4', senderId: 'client-1', text: 'Your content strategy work is exactly what we need. Could we schedule a call?', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString() },
        { id: 'msg-5', senderId: '4', text: 'Absolutely! I am available tomorrow afternoon. Does that work for you?', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 20).toISOString() },
      ],
      lastMessage: 'Absolutely! I am available tomorrow afternoon. Does that work for you?',
      lastMessageTimestamp: new Date(Date.now() - 1000 * 60 * 60 * 20).toISOString(),
    }
  ];

export const db = {
  freelancers,
  conversations,
}
