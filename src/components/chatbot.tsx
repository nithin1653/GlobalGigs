
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
import type { QuizState } from '@/ai/flows/agent';
import { marked } from 'marked';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { useAuth } from '@/hooks/use-auth';

interface ChatMessage {
    role: 'user' | 'assistant';
    content: string;
}

interface ParsedResponse {
    content: string;
    options?: string[];
    isComplete?: boolean;
}

const parseResponse = (text: string): ParsedResponse => {
    const optionsMatch = text.match(/\[OPTIONS: (.*?)\]/);
    const isCompleteMatch = text.match(/\[COMPLETE\]/);
    let content = text;
    
    let options: string[] | undefined;
    if (optionsMatch) {
        options = optionsMatch[1].split(',').map(opt => opt.trim());
        content = content.replace(optionsMatch[0], '').trim();
    }

    if (isCompleteMatch) {
        content = content.replace(isCompleteMatch[0], '').trim();
    }
    
    return { content, options, isComplete: !!isCompleteMatch };
};

export default function Chatbot() {
    const [isOpen, setIsOpen] = useState(false);
    const [history, setHistory] = useState<ChatMessage[]>([]);
    const [quizState, setQuizState] = useState<QuizState>({});
    const [currentOptions, setCurrentOptions] = useState<string[]>([]);
    const [isComplete, setIsComplete] = useState(false);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const scrollAreaRef = useRef<HTMLDivElement>(null);
    const { user, userProfile } = useAuth();
    
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
        setQuizState({});
        setCurrentOptions([]);
        setIsComplete(false);

        try {
            const response = await chatWithAgent({});
            const parsed = parseResponse(response.text);
            
            setHistory([{ role: 'assistant', content: parsed.content }]);
            setQuizState(response.state);
            setCurrentOptions(parsed.options || []);
            
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
        setHistory(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);
        setCurrentOptions([]);

        // If the conversation was complete, and user sends a message, we restart.
        const stateToUse = isComplete ? {} : quizState;

        try {
            const response = await chatWithAgent(stateToUse, messageContent);
            const parsed = parseResponse(response.text);

            setHistory(prev => [...prev, { role: 'assistant', content: parsed.content }]);
            setQuizState(response.state);
            setCurrentOptions(parsed.options || []);
            setIsComplete(parsed.isComplete || false);
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
        if (nextIsOpen && history.length === 0) {
            startConversation();
        }
    }

    const showTextInput = currentOptions.length === 0;

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
                                                            'text-white' // Make all text white
                                                        )} dangerouslySetInnerHTML={{ __html: marked.parse(message.content) }}></div>

                                                        {message.role === 'user' && (
                                                            <Avatar className="h-8 w-8 self-start">
                                                                <AvatarImage src={userProfile?.avatarUrl} />
                                                                <AvatarFallback>{userProfile?.name?.charAt(0) ?? 'U'}</AvatarFallback>
                                                            </Avatar>
                                                        )}
                                                    </div>
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
                                <CardFooter className="border-t pt-6 bg-muted/30">
                                    {currentOptions.length > 0 && !isLoading && (
                                        <div className="flex flex-wrap gap-2">
                                            {currentOptions.map(option => (
                                                <Button key={option} size="sm" variant="outline" onClick={() => handleOptionClick(option)} disabled={isLoading}>
                                                    {option}
                                                </Button>
                                            ))}
                                        </div>
                                    )}
                                    {showTextInput && !isLoading && (
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
