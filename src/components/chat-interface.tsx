'use client';

import { useState, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Conversation, Message } from '@/lib/mock-data';
import { getConversations } from '@/lib/firebase';
import { cn } from '@/lib/utils';
import { Send, Search } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from '@/hooks/use-auth';

export default function ChatInterface() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    async function loadData() {
      try {
        const data = await getConversations();
        setConversations(data);
        if (data.length > 0) {
          setActiveConversationId(data[0].id);
        }
      } catch (error) {
        console.error("Failed to fetch conversations", error);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  const activeConversation = conversations.find(c => c.id === activeConversationId);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeConversation || !user) return;

    const message: Message = {
      id: `msg-${Date.now()}`,
      senderId: user.uid, // Current user's ID from Firebase Auth
      text: newMessage,
      timestamp: new Date(),
    };

    const updatedConversations = conversations.map(c => {
      if (c.id === activeConversationId) {
        return {
          ...c,
          messages: [...c.messages, message],
          lastMessage: newMessage,
          lastMessageTimestamp: new Date(),
        };
      }
      return c;
    });

    setConversations(updatedConversations);
    setNewMessage('');
  };
  
  if (isLoading) {
    return <div className="flex h-full border-t bg-background/60 items-center justify-center">Loading chats...</div>;
  }

  return (
    <div className="flex h-full border-t bg-background/60">
      {/* Sidebar with conversations */}
      <div className={cn(
        "w-full md:w-80 lg:w-96 flex flex-col border-r transition-transform duration-300",
        activeConversationId ? "max-md:-translate-x-full" : "max-md:translate-x-0"
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
              onClick={() => setActiveConversationId(conv.id)}
              className={cn(
                'flex items-center gap-4 p-4 w-full text-left transition-colors hover:bg-muted/50',
                activeConversationId === conv.id && 'bg-muted'
              )}
            >
              <Avatar>
                <AvatarImage src={conv.participant.avatarUrl} />
                <AvatarFallback>{conv.participant.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="flex-1 overflow-hidden">
                <div className="flex justify-between items-center">
                    <p className="font-semibold truncate">{conv.participant.name}</p>
                    <p className="text-xs text-muted-foreground whitespace-nowrap">
                        {formatDistanceToNow(new Date(conv.lastMessageTimestamp), { addSuffix: true })}
                    </p>
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
        activeConversationId ? "flex translate-x-0" : "max-md:translate-x-full"
      )}>
        {activeConversation ? (
          <>
            <div className="flex items-center gap-4 p-4 border-b bg-background/80 backdrop-blur-lg">
                <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setActiveConversationId(null)}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-arrow-left"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>
                </Button>
              <Avatar>
                <AvatarImage src={activeConversation.participant.avatarUrl} />
                <AvatarFallback>{activeConversation.participant.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold">{activeConversation.participant.name}</p>
                <p className="text-xs text-muted-foreground">{activeConversation.participant.role}</p>
              </div>
            </div>
            
            <ScrollArea className="flex-1 p-6">
              <div className="space-y-6">
                {activeConversation.messages.map((message) => (
                  <div key={message.id} className={cn(
                      'flex items-end gap-2',
                      message.senderId !== activeConversation.participant.id ? 'justify-end' : 'justify-start'
                    )}>
                    {message.senderId === activeConversation.participant.id && (
                        <Avatar className="h-8 w-8">
                            <AvatarImage src={activeConversation.participant.avatarUrl} />
                            <AvatarFallback>{activeConversation.participant.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                    )}
                    <div className={cn(
                        'max-w-xs lg:max-w-md p-3 rounded-2xl',
                        message.senderId !== activeConversation.participant.id
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
                  disabled={!user}
                />
                <Button type="submit" size="icon" disabled={!newMessage.trim() || !user}>
                  <Send className="h-4 w-4" />
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
