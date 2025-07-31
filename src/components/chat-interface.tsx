
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { Conversation, Message, UserProfile } from '@/lib/mock-data';
import { getConversationsForUser, findOrCreateConversation, sendMessage, subscribeToConversation, getUserProfile, getFreelancerById } from '@/lib/firebase';
import { cn } from '@/lib/utils';
import { Send, Search, Loader2, ArrowLeft } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from '@/hooks/use-auth.js';
import { Unsubscribe } from 'firebase/database';

export default function ChatInterface() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  const { user } = useAuth();
  const searchParams = useSearchParams();
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  let unsubscribe: Unsubscribe | null = null;
  
  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
        scrollAreaRef.current.scrollTo({ top: scrollAreaRef.current.scrollHeight });
    }
  };

  const handleSetActiveConversation = (conv: Conversation | null) => {
    if (unsubscribe) {
        unsubscribe();
        unsubscribe = null;
    }
    setActiveConversation(conv);
    if (conv) {
        unsubscribe = subscribeToConversation(conv.id, (newMessages) => {
            setMessages(newMessages);
        });
    }
  };


  useEffect(() => {
    async function loadInitialData() {
      if (!user) {
        setIsLoading(false);
        return;
      }
      
      setIsLoading(true);
      try {
        const profile = await getUserProfile(user.uid);
        if (!profile) throw new Error("User profile not found");
        setUserProfile(profile);

        const convs = await getConversationsForUser(user.uid, profile.role);
        setConversations(convs);

        const freelancerId = searchParams.get('freelancerId');
        if (freelancerId && profile.role === 'client') {
            const conversation = await findOrCreateConversation(user.uid, freelancerId);
            if (!convs.find(c => c.id === conversation.id)) {
                setConversations(prev => [...prev, conversation]);
            }
            handleSetActiveConversation(conversation);
        } else if (convs.length > 0) {
            handleSetActiveConversation(convs[0]);
        }
      } catch (error) {
        console.error("Failed to fetch conversations", error);
      } finally {
        setIsLoading(false);
      }
    }
    loadInitialData();

    return () => {
        if (unsubscribe) {
            unsubscribe();
        }
    }
  }, [user, searchParams]);
  
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeConversation || !user) return;

    setIsSending(true);
    const message: Message = {
      id: '', // will be set by firebase
      senderId: user.uid,
      text: newMessage,
      timestamp: new Date(),
    };
    
    try {
        await sendMessage(activeConversation.id, message);
        setNewMessage('');
    } catch (error) {
        console.error("Error sending message", error);
    } finally {
        setIsSending(false);
        setTimeout(scrollToBottom, 100);
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex h-full border-t bg-background/60 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
          <p className="ml-2">Loading chats...</p>
      </div>
    );
  }

  return (
    <div className="flex h-full border-t bg-background/60">
      {/* Sidebar with conversations */}
      <div className={cn(
        "w-full md:w-80 lg:w-96 flex flex-col border-r transition-transform duration-300",
        activeConversation ? "max-md:-translate-x-full" : "max-md:translate-x-0"
        )}>
        <div className="p-4 border-b">
            <h2 className="text-xl font-bold font-headline">Messages</h2>
            <div className="relative mt-2">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search messages..." className="pl-9" />
            </div>
        </div>
        <ScrollArea className="flex-1">
          {conversations.map((conv) => (
            <button
              key={conv.id}
              onClick={() => handleSetActiveConversation(conv)}
              className={cn(
                'flex items-center gap-4 p-4 w-full text-left transition-colors hover:bg-muted/50',
                activeConversation?.id === conv.id && 'bg-muted'
              )}
            >
              <Avatar>
                <AvatarImage src={conv.participant.avatarUrl} />
                <AvatarFallback>{conv.participant.name?.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="flex-1 overflow-hidden">
                <div className="flex justify-between items-center">
                    <p className="font-semibold truncate">{conv.participant.name}</p>
                    {conv.lastMessageTimestamp && <p className="text-xs text-muted-foreground whitespace-nowrap">
                        {formatDistanceToNow(new Date(conv.lastMessageTimestamp), { addSuffix: true })}
                    </p>}
                </div>
                <p className="text-sm text-muted-foreground truncate">{conv.lastMessage}</p>
              </div>
            </button>
          ))}
        </ScrollArea>
      </div>

      {/* Main chat window */}
      <div className={cn(
        "flex-1 flex-col h-full absolute md:static inset-0 bg-background transition-transform duration-300",
        activeConversation ? "flex translate-x-0" : "max-md:translate-x-full"
      )}>
        {activeConversation ? (
          <>
            <div className="flex items-center gap-4 p-4 border-b bg-background/80 backdrop-blur-lg">
                <Button variant="ghost" size="icon" className="md:hidden" onClick={() => handleSetActiveConversation(null)}>
                    <ArrowLeft />
                </Button>
              <Avatar>
                <AvatarImage src={activeConversation.participant.avatarUrl} />
                <AvatarFallback>{activeConversation.participant.name?.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold">{activeConversation.participant.name}</p>
                <p className="text-xs text-muted-foreground">{activeConversation.participant.role}</p>
              </div>
            </div>
            
            <ScrollArea className="flex-1 p-6" ref={scrollAreaRef}>
              <div className="space-y-6">
                {messages.map((message) => (
                  <div key={message.id} className={cn(
                      'flex items-end gap-2',
                      message.senderId === user?.uid ? 'justify-end' : 'justify-start'
                    )}>
                    {message.senderId !== user?.uid && (
                        <Avatar className="h-8 w-8">
                            <AvatarImage src={activeConversation.participant.avatarUrl} />
                            <AvatarFallback>{activeConversation.participant.name?.charAt(0)}</AvatarFallback>
                        </Avatar>
                    )}
                    <div className={cn(
                        'max-w-xs lg:max-w-md p-3 rounded-2xl',
                        message.senderId === user?.uid
                          ? 'bg-primary text-primary-foreground rounded-br-none'
                          : 'bg-muted rounded-bl-none'
                      )}
                    >
                      <p className="text-sm">{message.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            <div className="p-4 border-t bg-background/80 backdrop-blur-lg">
              <form onSubmit={handleSendMessage} className="flex items-center gap-4">
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  autoComplete="off"
                  disabled={!user || isSending}
                />
                <Button type="submit" size="icon" disabled={!newMessage.trim() || !user || isSending}>
                  {isSending ? <Loader2 className="h-4 w-4 animate-spin"/> : <Send className="h-4 w-4" />}
                </Button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            <p>Select a conversation to start chatting</p>
          </div>
        )}
      </div>
    </div>
  );
}
