
import React, { useState, KeyboardEvent, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CitationList, CitationProps } from "@/components/Citation";
import { 
  Sheet, 
  SheetContent, 
  SheetHeader,
  SheetTitle,
  SheetFooter
} from "@/components/ui/sheet";
import { ArrowLeft, Send } from "lucide-react";
import { getExpertChatResponse } from '@/services/perplexityService';
import { useToast } from '@/hooks/use-toast';

interface Message {
  sender: 'user' | 'expert';
  content: string;
  citations?: CitationProps[];
}

interface ExpertChatDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  expertTitle: string;
  initialContent: string;
  initialCitations: CitationProps[];
  followUpQuestion: string;
  onSendMessage: (message: string) => void;
  originalQuestion?: string;
}

const ExpertChatDrawer: React.FC<ExpertChatDrawerProps> = ({
  isOpen,
  onClose,
  expertTitle,
  initialContent,
  initialCitations,
  followUpQuestion,
  onSendMessage,
  originalQuestion = "Original question"
}) => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    // Display the original question first if available
    originalQuestion ? {
      sender: 'user',
      content: `Original question: ${originalQuestion}`
    } : null,
    // Then show the expert's initial response
    { 
      sender: 'expert', 
      content: initialContent, 
      citations: initialCitations 
    },
    // Then the follow-up question
    { 
      sender: 'user', 
      content: `Follow-up question: ${followUpQuestion}` 
    }
  ].filter(Boolean) as Message[]);
  
  const [isLoading, setIsLoading] = useState(true);
  const [streamContent, setStreamContent] = useState('');
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Scroll to bottom of chat when messages change
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  // Process the initial follow-up question
  useEffect(() => {
    if (isOpen && followUpQuestion && messages.length === 3) {
      processExpertResponse(followUpQuestion);
    }
  }, [isOpen, followUpQuestion]);

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && message.trim() !== '' && !isLoading) {
      handleSendMessage();
    }
  };

  const processExpertResponse = async (userMessage: string) => {
    setIsLoading(true);
    
    try {
      // Start with an empty streaming message
      setStreamContent('');
      setMessages(prev => [...prev, { sender: 'expert', content: '', citations: [] }]);
      
      // Get previous messages for context (excluding the empty streaming message we just added)
      const previousMessages = messages.map(msg => ({
        sender: msg.sender,
        content: msg.content
      }));
      
      // Call the streaming API
      const { content, citations } = await getExpertChatResponse(
        userMessage,
        expertTitle,
        previousMessages,
        (chunk) => {
          // Update streaming content as chunks arrive
          setStreamContent(prev => prev + chunk);
        }
      );
      
      // Replace the empty message with the complete response
      setMessages(prev => [
        ...prev.slice(0, prev.length - 1),
        { sender: 'expert', content, citations }
      ]);
      
      // Clear the streaming content
      setStreamContent('');
    } catch (error) {
      console.error('Error getting expert response:', error);
      toast({
        title: 'Error',
        description: 'Failed to get expert response. Please try again.',
        variant: 'destructive',
      });
      
      // Remove the empty message if there was an error
      setMessages(prev => prev.slice(0, prev.length - 1));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = () => {
    if (message.trim() === '' || isLoading) return;

    // Add user message to chat
    setMessages(prev => [...prev, { sender: 'user', content: message }]);
    
    // Call parent handler to process the message
    onSendMessage(message);
    
    // Process the message with the expert
    const userMessage = message;
    
    // Clear input
    setMessage('');
    
    // Get expert response
    processExpertResponse(userMessage);
  };

  return (
    <Sheet open={isOpen} onOpenChange={open => {
      if (!open) onClose();
    }}>
      <SheetContent side="right" className="w-full sm:max-w-md md:max-w-lg lg:max-w-xl p-0 flex flex-col h-full">
        <SheetHeader className="p-4 border-b">
          <div className="flex items-center">
            <Button 
              variant="ghost" 
              size="sm" 
              className="mr-2" 
              onClick={onClose}
              disabled={isLoading}
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              <span>Back to Panel</span>
            </Button>
            <SheetTitle className="ml-2">Chat with {expertTitle}</SheetTitle>
          </div>
        </SheetHeader>
        
        <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg, index) => (
            <div 
              key={index} 
              className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div 
                className={`max-w-[85%] rounded-lg p-3 ${
                  msg.sender === 'user' 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-muted'
                }`}
              >
                <p className="whitespace-pre-wrap">{msg.content}</p>
                {msg.citations && msg.citations.length > 0 && <CitationList citations={msg.citations} />}
              </div>
            </div>
          ))}
          
          {/* Display streaming content */}
          {streamContent && (
            <div className="flex justify-start">
              <div className="max-w-[85%] rounded-lg p-3 bg-muted">
                <p className="whitespace-pre-wrap">{streamContent}</p>
              </div>
            </div>
          )}
          
          {/* Loading indicator */}
          {isLoading && !streamContent && (
            <div className="flex justify-center items-center py-4">
              <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin"></div>
            </div>
          )}
        </div>
        
        <SheetFooter className="p-4 border-t">
          <div className="flex w-full gap-2">
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your message..."
              className="flex-1"
              disabled={isLoading}
            />
            <Button onClick={handleSendMessage} disabled={message.trim() === '' || isLoading}>
              <Send className="h-4 w-4 mr-1" />
              {isLoading ? 'Sending...' : 'Send'}
            </Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

export default ExpertChatDrawer;
