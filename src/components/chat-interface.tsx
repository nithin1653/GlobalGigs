
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { Conversation, Message } from '@/lib/mock-data';
import { getConversationsForUser, findOrCreateConversation, sendMessage, subscribeToConversation } from '@/lib/firebase';
import { cn } from '@/lib/utils';
import { Send, Loader2, ArrowLeft, MessageSquare, Circle } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth.js';
import type { Unsubscribe } from 'firebase/database';
import { ProposeGigDialog } from '@/components/propose-gig-dialog';
import { GigProposalCard } from '@/components/gig-proposal-card';

export default function ChatInterface() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  
  const { user, userProfile } = useAuth();
  const searchParams = useSearchParams();
  const viewportRef = useRef<HTMLDivElement>(null);
  const conversationSubscription = useRef<Unsubscribe | null>(null);

  const scrollToBottom = useCallback(() => {
    if (viewportRef.current) {
        viewportRef.current.scrollTo({ top: viewportRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, []);

  const selectConversation = useCallback((conv: Conversation | null) => {
    if (conversationSubscription.current) {
        conversationSubscription.current();
        conversationSubscription.current = null;
    }
    setActiveConversation(conv);
    if (conv) {
        setIsLoading(true);
        setMessages([]);
        conversationSubscription.current = subscribeToConversation(conv.id, (newMessages) => {
            setMessages(newMessages);
            setIsLoading(false);
            setTimeout(scrollToBottom, 100); 
        });
    } else {
        setMessages([]);
    }
  }, [scrollToBottom]);

  useEffect(() => {
    let isMounted = true;
    async function loadInitialData() {
      if (!user || !userProfile) {
        return;
      }
      
      setIsLoading(true);
      try {
        const convs = await getConversationsForUser(user.uid, userProfile.role);
        if (!isMounted) return;
        
        const freelancerId = searchParams.get('freelancerId');
        
        let targetConversation: Conversation | null = null;
        let finalConversations = [...convs];

        if (freelancerId && userProfile.role === 'client') {
            const conversation = await findOrCreateConversation(user.uid, freelancerId);
            if (!isMounted) return;

            const existingConvIndex = finalConversations.findIndex(c => c.id === conversation.id);
            if (existingConvIndex === -1) {
                finalConversations = [conversation, ...finalConversations];
            } else {
                const existingConv = { ...finalConversations[existingConvIndex], participant: conversation.participant };
                finalConversations.splice(existingConvIndex, 1);
                finalConversations.unshift(existingConv);
            }
            targetConversation = conversation;
        }

        if (isMounted) {
            setConversations(finalConversations);
            if (targetConversation) {
                selectConversation(targetConversation);
            } else if (finalConversations.length > 0 && !searchParams.get('freelancerId')) {
                selectConversation(finalConversations[0]);
            } else {
                setIsLoading(false);
            }
        }

      } catch (error) {
        console.error("[Chat] Failed to fetch conversations", error);
      }
    }
    loadInitialData();

    return () => {
        isMounted = false;
        if (conversationSubscription.current) {
            conversationSubscription.current();
        }
    }
  }, [user, userProfile, searchParams, selectConversation]);
  
  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeConversation || !user) return;

    setIsSending(true);
    const message: Omit<Message, 'id'> = {
      senderId: user.uid,
      text: newMessage,
      timestamp: new Date(),
    };
    
    try {
        await sendMessage(activeConversation.id, message);
        setNewMessage('');
    } catch (error) {
        console.error("[Chat] Error sending message", error);
    } finally {
        setIsSending(false);
    }
  };
  
  if (isLoading && conversations.length === 0 && !activeConversation) {
    return (
      <div className="flex h-full bg-background/60 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
          <p className="ml-2">Loading chats...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-background">
        {/* Horizontal "Stories" Bar */}
        <div className="flex-shrink-0 border-b">
            <ScrollArea className="w-full whitespace-nowrap">
                <div className="flex items-center gap-4 p-4">
                {conversations.map((conv) => (
                    <button
                        key={conv.id}
                        onClick={() => selectConversation(conv)}
                        className="flex flex-col items-center gap-2 text-center w-20"
                    >
                        <Avatar className={cn(
                            "h-16 w-16 border-2 transition-all",
                            activeConversation?.id === conv.id ? "border-primary" : "border-transparent"
                        )}>
                            <AvatarImage src={conv.participant.avatarUrl} alt={conv.participant.name}/>
                            <AvatarFallback>{conv.participant.name?.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <p className={cn(
                            "text-xs truncate w-full",
                             activeConversation?.id === conv.id ? "font-semibold text-primary" : "text-muted-foreground"
                        )}>
                            {conv.participant.name}
                        </p>
                    </button>
                ))}
                </div>
            </ScrollArea>
        </div>


        {/* Chat Window */}
        <div className="flex-1 flex flex-col min-h-0">
            {activeConversation ? (
            <>
                {/* Header is now part of the top bar */}

                <ScrollArea className="flex-1" viewportRef={viewportRef}>
                    <div className="space-y-6 p-6">
                        {messages.map((message) => {
                        const isProposal = message.metadata?.type === 'gig-proposal';

                        if (isProposal) {
                            return (
                                <GigProposalCard 
                                    key={message.id} 
                                    proposalId={message.metadata.proposalId!} 
                                    currentUserId={user!.uid}
                                />
                            );
                        }

                        return (
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
                                <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                            </div>
                            </div>
                        );
                        })}

                        {(isLoading && messages.length === 0) && (
                            <div className="flex justify-center py-4">
                                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                            </div>
                        )}
                    </div>
                </ScrollArea>

                <div className="flex-shrink-0 p-4 border-t bg-background/80 backdrop-blur-lg">
                <form onSubmit={handleSendMessage} className="flex items-center gap-4">
                    {userProfile?.role === 'freelancer' && (
                    <ProposeGigDialog 
                        conversation={activeConversation}
                        freelancerId={user.uid}
                    />
                    )}
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
            <div className="flex-1 flex items-center justify-center text-center text-muted-foreground p-4">
                <div className="flex flex-col items-center gap-2">
                    <MessageSquare className="h-12 w-12" />
                    <h3 className="text-lg font-semibold">Welcome to your Inbox</h3>
                    <p>Select a conversation from the top to start chatting</p>
                </div>
            </div>
            )}
        </div>
    </div>
  );
}
