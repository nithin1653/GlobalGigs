// src/components/chatbot.tsx
'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { ScrollArea } from './ui/scroll-area';
import { MessageSquare, Send, X, Loader2, Bot } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { chatWithAgent } from '@/app/actions';
import { marked } from 'marked';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { useAuth } from '@/hooks/use-auth';

interface ChatMessage {
    role: 'user' | 'assistant';
    content: string;
}

export default function Chatbot() {
    const [isOpen, setIsOpen] = useState(false);
    const [history, setHistory] = useState<ChatMessage[]>([
        { role: 'assistant', content: 'Hello! How can I help you today? You can ask me about the platform or for freelancer recommendations.' }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const scrollAreaRef = useRef<HTMLDivElement>(null);
    const { user, userProfile } = useAuth();


    const scrollToBottom = () => {
        if (scrollAreaRef.current) {
            scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
        }
    };

    useEffect(() => {
        scrollToBottom();
    }, [history]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim()) return;

        const userMessage: ChatMessage = { role: 'user', content: input };
        const newHistory = [...history, userMessage];
        setHistory(newHistory);
        setInput('');
        setIsLoading(true);

        try {
            const response = await chatWithAgent(newHistory, input);
            const botMessage: ChatMessage = { role: 'assistant', content: response };
            setHistory(prev => [...prev, botMessage]);
        } catch (error) {
            console.error("Chatbot error:", error);
            const errorMessage: ChatMessage = { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.' };
            setHistory(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <div className="fixed bottom-6 right-6 z-50">
                <AnimatePresence>
                    {isOpen && (
                        <motion.div
                            initial={{ opacity: 0, y: 20, scale: 0.9 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 20, scale: 0.9 }}
                            transition={{ duration: 0.2 }}
                            className="w-[calc(100vw-3rem)] max-w-md"
                        >
                            <Card className="h-[70vh] flex flex-col shadow-2xl">
                                <CardHeader className="flex flex-row items-center justify-between">
                                    <div className='flex items-center gap-3'>
                                        <div className="relative">
                                            <Avatar>
                                                <AvatarFallback className='bg-primary text-primary-foreground'><Bot /></AvatarFallback>
                                            </Avatar>
                                            <span className="absolute bottom-0 right-0 block h-3 w-3 rounded-full bg-green-500 border-2 border-background"></span>
                                        </div>
                                        <div>
                                            <CardTitle>GlobalGigs Assistant</CardTitle>
                                            <CardDescription>Ready to help</CardDescription>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="flex-1 overflow-hidden p-0">
                                    <ScrollArea className="h-full">
                                        <div ref={scrollAreaRef} className="p-6 space-y-4">
                                            {history.map((message, index) => (
                                                <div key={index} className={cn('flex items-end gap-2', message.role === 'user' ? 'justify-end' : 'justify-start')}>
                                                     {message.role === 'assistant' && (
                                                        <Avatar className="h-8 w-8 self-start">
                                                            <AvatarFallback className='bg-primary text-primary-foreground'><Bot /></AvatarFallback>
                                                        </Avatar>
                                                     )}

                                                    <div className={cn(
                                                        'max-w-xs lg:max-w-sm p-3 rounded-2xl prose prose-sm',
                                                        message.role === 'user'
                                                            ? 'bg-primary text-primary-foreground rounded-br-none'
                                                            : 'bg-muted rounded-bl-none'
                                                    )} dangerouslySetInnerHTML={{ __html: marked(message.content) }}></div>

                                                    {message.role === 'user' && (
                                                         <Avatar className="h-8 w-8 self-start">
                                                            <AvatarImage src={userProfile?.avatarUrl} />
                                                            <AvatarFallback>{userProfile?.name?.charAt(0) ?? 'U'}</AvatarFallback>
                                                        </Avatar>
                                                    )}
                                                </div>
                                            ))}
                                            {isLoading && (
                                                <div className="flex justify-start items-end gap-2">
                                                    <Avatar className="h-8 w-8 self-start">
                                                        <AvatarFallback className='bg-primary text-primary-foreground'><Bot /></AvatarFallback>
                                                    </Avatar>
                                                    <div className="bg-muted p-3 rounded-2xl rounded-bl-none">
                                                        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </ScrollArea>
                                </CardContent>
                                <CardFooter>
                                    <form onSubmit={handleSendMessage} className="flex w-full items-center gap-2">
                                        <Input
                                            value={input}
                                            onChange={(e) => setInput(e.target.value)}
                                            placeholder="Ask a question..."
                                            disabled={isLoading}
                                        />
                                        <Button type="submit" size="icon" disabled={isLoading || !input.trim()}>
                                            {isLoading ? <Loader2 className="h-4 w-4 animate-spin"/> : <Send className="h-4 w-4" />}
                                        </Button>
                                    </form>
                                </CardFooter>
                            </Card>
                        </motion.div>
                    )}
                </AnimatePresence>

                <Button
                    size="icon"
                    className="rounded-full h-16 w-16 shadow-lg mt-4"
                    onClick={() => setIsOpen(prev => !prev)}
                >
                    <AnimatePresence initial={false} mode="wait">
                        <motion.div
                            key={isOpen ? 'close' : 'open'}
                            initial={{ opacity: 0, rotate: -90, scale: 0.5 }}
                            animate={{ opacity: 1, rotate: 0, scale: 1 }}
                            exit={{ opacity: 0, rotate: 90, scale: 0.5 }}
                            transition={{ duration: 0.2 }}
                        >
                            {isOpen ? <X className="h-8 w-8"/> : <MessageSquare className="h-8 w-8" />}
                        </motion.div>
                    </AnimatePresence>
                </Button>
            </div>
        </>
    );
}
