
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
    options?: string[];
    isComplete?: boolean;
}

const parseMessage = (content: string): ChatMessage => {
    const optionsMatch = content.match(/\[OPTIONS: (.*?)\]/);
    const isCompleteMatch = content.match(/\[COMPLETE\]/);
    let cleanContent = content;
    
    let options: string[] | undefined;
    if (optionsMatch) {
        options = optionsMatch[1].split(',').map(opt => opt.trim());
        cleanContent = cleanContent.replace(optionsMatch[0], '').trim();
    }

    let isComplete = !!isCompleteMatch;
    if (isCompleteMatch) {
        cleanContent = cleanContent.replace(isCompleteMatch[0], '').trim();
    }
    
    return { role: 'assistant', content: cleanContent, options, isComplete };
};


export default function Chatbot() {
    const [isOpen, setIsOpen] = useState(false);
    const [history, setHistory] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const scrollAreaRef = useRef<HTMLDivElement>(null);
    const { user, userProfile } = useAuth();
    const [showTextInput, setShowTextInput] = useState(false);


    const scrollToBottom = () => {
        setTimeout(() => {
            if (scrollAreaRef.current) {
                scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
            }
        }, 100);
    };
    
    useEffect(() => {
        scrollToBottom();
    }, [history]);

    const startConversation = async () => {
        setIsLoading(true);
        setHistory([]);
        try {
            const initialGreeting = "Hi! I'm Gigi. I can help you find the perfect freelancer. Let's start with the category of work you're looking for. [OPTIONS: Web & App Development, Design & Creative, Writing & Translation, Marketing & Sales]";
            const parsedMessage = parseMessage(initialGreeting);
            setHistory([parsedMessage]);
            setShowTextInput(!parsedMessage.options);
        } catch (error) {
            console.error("Chatbot error:", error);
            const errorMessage: ChatMessage = { role: 'assistant', content: 'Sorry, I can\'t seem to start the conversation right now.' };
            setHistory([errorMessage]);
        } finally {
            setIsLoading(false);
        }
    }

    const handleSendMessage = async (messageContent: string) => {
        if (!messageContent.trim()) return;

        const userMessage: ChatMessage = { role: 'user', content: messageContent };
        const newHistory = [...history, userMessage];
        setHistory(newHistory);
        setInput('');
        setIsLoading(true);
        setShowTextInput(false);

        try {
            const response = await chatWithAgent(newHistory);
            const parsedBotMessage = parseMessage(response);
            setHistory(prev => [...prev, parsedBotMessage]);
            setShowTextInput(!parsedBotMessage.options && !parsedBotMessage.isComplete);
        } catch (error) {
            console.error("Chatbot error:", error);
            const errorMessage: ChatMessage = { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.' };
            setHistory(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        handleSendMessage(input);
    }
    
    const handleOptionClick = (option: string) => {
        handleSendMessage(option);
    }

    const handleToggle = () => {
        const nextIsOpen = !isOpen;
        setIsOpen(nextIsOpen);
        if (nextIsOpen) {
            startConversation();
        }
    }


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
                                            <CardTitle>Gigi Assistant</CardTitle>
                                            <CardDescription>Your AI assistant</CardDescription>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="flex-1 overflow-hidden p-0">
                                    <ScrollArea className="h-full">
                                        <div ref={scrollAreaRef} className="p-6 space-y-4">
                                            {history.map((message, index) => (
                                                <div key={index}>
                                                    <div className={cn('flex items-end gap-2', message.role === 'user' ? 'justify-end' : 'justify-start')}>
                                                        {message.role === 'assistant' && (
                                                            <Avatar className="h-8 w-8 self-start">
                                                                <AvatarFallback className='bg-primary text-primary-foreground'><Bot /></AvatarFallback>
                                                            </Avatar>
                                                        )}

                                                        <div className={cn(
                                                            'max-w-xs lg:max-w-sm p-3 rounded-2xl prose prose-sm prose-invert',
                                                            message.role === 'user'
                                                                ? 'bg-primary text-white rounded-br-none'
                                                                : 'bg-muted rounded-bl-none',
                                                            message.role === 'assistant' && 'text-white'
                                                        )} dangerouslySetInnerHTML={{ __html: marked(message.content) }}></div>

                                                        {message.role === 'user' && (
                                                            <Avatar className="h-8 w-8 self-start">
                                                                <AvatarImage src={userProfile?.avatarUrl} />
                                                                <AvatarFallback>{userProfile?.name?.charAt(0) ?? 'U'}</AvatarFallback>
                                                            </Avatar>
                                                        )}
                                                    </div>
                                                     {message.role === 'assistant' && message.options && (
                                                        <div className="flex flex-wrap gap-2 mt-2 ml-10">
                                                            {message.options.map(option => (
                                                                <Button key={option} size="sm" variant="outline" onClick={() => handleOptionClick(option)} disabled={isLoading}>
                                                                    {option}
                                                                </Button>
                                                            ))}
                                                        </div>
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
                                <CardFooter className="border-t bg-background/30 pt-6">
                                    {showTextInput && (
                                        <form onSubmit={handleFormSubmit} className="flex w-full items-center gap-2">
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
                                    )}
                                </CardFooter>
                            </Card>
                        </motion.div>
                    )}
                </AnimatePresence>

                <Button
                    size="icon"
                    className="rounded-full h-16 w-16 shadow-lg mt-4"
                    onClick={handleToggle}
                >
                    <AnimatePresence initial={false} mode="wait">
                        <motion.div
                            key={isOpen ? 'close' : 'open'}
                            initial={{ opacity: 0, rotate: -90, scale: 0.5 }}
                            animate={{ opacity: 1, rotate: 0, scale: 1 }}
                            exit={{ opacity: 0, rotate: 90, scale: 0.5 }}
                            transition={{ duration: 0.2 }}
                            className="flex items-center justify-center"
                        >
                            {isOpen ? <X className="h-8 w-8"/> : <MessageSquare className="h-8 w-8" />}
                        </motion.div>
                    </AnimatePresence>
                </Button>
            </div>
        </>
    );
}
