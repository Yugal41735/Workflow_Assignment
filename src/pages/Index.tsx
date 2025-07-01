
import React, { useState } from 'react';
import { useToast } from "@/hooks/use-toast";
import QuestionInput from "@/components/QuestionInput";
import TopicSelector, { TopicType } from "@/components/TopicSelector";
import ExpertPanel from "@/components/ExpertPanel";
import FollowUpModal from "@/components/FollowUpModal";
import ExpertChatDrawer from "@/components/ExpertChatDrawer";
import { CitationProps } from "@/components/Citation";
import { ExpertResponseProps } from "@/components/ExpertResponse";
import ApiKeyInput from "@/components/ApiKeyInput";
import { getExpertPanelResponse } from "@/services/perplexityService";

const Index: React.FC = () => {
  const [topic, setTopic] = useState<TopicType>('tech');
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [responses, setResponses] = useState<Omit<ExpertResponseProps, 'onAskFollowUp' | 'topic'>[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [followUpExpert, setFollowUpExpert] = useState<string | null>(null);
  const [isFollowUpModalOpen, setIsFollowUpModalOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [followUpQuestion, setFollowUpQuestion] = useState('');
  const [activeExpertResponse, setActiveExpertResponse] = useState<Omit<ExpertResponseProps, 'onAskFollowUp' | 'topic'> | null>(null);
  const [isApiKeySet, setIsApiKeySet] = useState(false);
  
  const { toast } = useToast();

  const handleSubmitQuestion = async (question: string) => {
    if (!isApiKeySet) {
      toast({
        title: "API Key Required",
        description: "Please set your Perplexity API key to continue.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    setCurrentQuestion(question);
    
    try {
      const expertResponses = await getExpertPanelResponse(question, topic);
      setResponses(expertResponses);
    } catch (error) {
      console.error("Error getting expert responses:", error);
      toast({
        title: "Error",
        description: "Failed to get expert responses. Please try again.",
        variant: "destructive"
      });
      setResponses([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTopicChange = (newTopic: TopicType) => {
    setTopic(newTopic);
    if (currentQuestion && isApiKeySet) {
      setIsLoading(true);
      getExpertPanelResponse(currentQuestion, newTopic)
        .then(expertResponses => {
          setResponses(expertResponses);
        })
        .catch(error => {
          console.error("Error getting expert responses:", error);
          toast({
            title: "Error",
            description: "Failed to get expert responses. Please try again.",
            variant: "destructive"
          });
          setResponses([]);
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  };

  const handleAskFollowUp = (expertTitle: string) => {
    setFollowUpExpert(expertTitle);
    setIsFollowUpModalOpen(true);
    
    // Find the expert response for the selected expert
    const expertResponse = responses.find(response => response.title === expertTitle);
    if (expertResponse) {
      setActiveExpertResponse(expertResponse);
    }
  };

  const handleSubmitFollowUp = (question: string) => {
    setFollowUpQuestion(question);
    setIsFollowUpModalOpen(false);
    setIsChatOpen(true);
  };

  const handleSendChatMessage = (message: string) => {
    // This is handled by the ExpertChatDrawer component now
    console.log("Message sent to expert:", message);
  };

  const handleCloseChat = () => {
    setIsChatOpen(false);
    setFollowUpExpert(null);
    setFollowUpQuestion('');
    setActiveExpertResponse(null);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="py-6 border-b">
        <div className="container">
          <h1 className="text-3xl font-bold text-center">What Would Experts Say?</h1>
          <p className="text-center text-muted-foreground mt-2">
            Get multiple expert perspectives on any question
          </p>
        </div>
      </header>
      
      <main className="flex-1 container py-12">
        <div className="max-w-3xl mx-auto text-center mb-8">
          <ApiKeyInput onApiKeySet={() => setIsApiKeySet(true)} />
          
          <h2 className="text-xl font-medium mb-2">Ask your question</h2>
          <p className="text-muted-foreground mb-6">
            Get insights from multiple experts on technology, health, or finance topics
          </p>
          
          <TopicSelector
            selectedTopic={topic}
            onTopicChange={handleTopicChange}
            disabled={isLoading}
          />
          
          <QuestionInput onSubmit={handleSubmitQuestion} isLoading={isLoading} />
        </div>

        {isLoading && (
          <div className="flex justify-center items-center py-16">
            <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
              <p className="text-muted-foreground">Consulting the experts...</p>
            </div>
          </div>
        )}

        {currentQuestion && responses.length > 0 && !isLoading && (
          <div className="mt-12">
            <div className="mb-8 text-center">
              <h2 className="text-xl font-bold mb-2">"{currentQuestion}"</h2>
              <p className="text-muted-foreground">
                Here's what our panel of experts have to say:
              </p>
            </div>
            
            <ExpertPanel
              responses={responses}
              topic={topic}
              onAskFollowUp={handleAskFollowUp}
            />
          </div>
        )}
      </main>
      
      <FollowUpModal
        isOpen={isFollowUpModalOpen}
        expertTitle={followUpExpert}
        onClose={() => setIsFollowUpModalOpen(false)}
        onSubmit={handleSubmitFollowUp}
        isLoading={isLoading}
      />

      {activeExpertResponse && (
        <ExpertChatDrawer
          isOpen={isChatOpen}
          onClose={handleCloseChat}
          expertTitle={activeExpertResponse.title}
          initialContent={activeExpertResponse.content}
          initialCitations={activeExpertResponse.citations}
          followUpQuestion={followUpQuestion}
          onSendMessage={handleSendChatMessage}
          originalQuestion={currentQuestion}
        />
      )}
    </div>
  );
};

export default Index;
