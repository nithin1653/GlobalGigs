
import ChatInterface from '@/components/chat-interface';

export default function ClientMessagesPage() {
  return (
    <div className="flex flex-col h-[calc(100vh-64px)]">
        <div className="flex-1 border-t">
             <ChatInterface />
        </div>
    </div>
  );
}
