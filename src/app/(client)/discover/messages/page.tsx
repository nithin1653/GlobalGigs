
import ChatInterface from '@/components/chat-interface';

export default function ClientMessagesPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Your Conversations</h1>
      <div className="h-[calc(100vh-240px)] border rounded-lg overflow-hidden">
        <ChatInterface />
      </div>
    </div>
  );
}
