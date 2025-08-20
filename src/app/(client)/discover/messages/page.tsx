
import ChatInterface from '@/components/chat-interface';

export default function ClientMessagesPage() {
  return (
    <div className="flex flex-col h-[calc(100vh-64px)]">
        <div className="container mx-auto py-4">
            <h1 className="text-2xl font-bold">Your Conversations</h1>
        </div>
        <div className="flex-1 border-t">
             <ChatInterface />
        </div>
    </div>
  );
}
