
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CitationList, CitationProps } from "@/components/Citation";
import { TopicType } from "@/components/TopicSelector";
import { MessageCircle } from "lucide-react";

export interface ExpertResponseProps {
  title: string;
  content: string;
  topic: TopicType;
  citations: CitationProps[];
  onAskFollowUp: (expertTitle: string) => void;
}

const ExpertResponse: React.FC<ExpertResponseProps> = ({ 
  title, 
  content, 
  topic, 
  citations,
  onAskFollowUp
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const backgroundColor = {
    tech: 'bg-tech-light border-tech/10',
    health: 'bg-health-light border-health/10',
    finance: 'bg-finance-light border-finance/10'
  };

  const accentColor = {
    tech: 'text-tech',
    health: 'text-health',
    finance: 'text-finance'
  };

  const contentPreview = content.length > 300 && !isExpanded 
    ? content.substring(0, 300) + '...' 
    : content;

  return (
    <div 
      className={`speech-bubble ${topic} ${backgroundColor[topic]} p-6 border animate-fade-in opacity-0`} 
      style={{ animationDelay: '0.2s' }}
    >
      <h3 className={`font-bold text-lg mb-2 ${accentColor[topic]}`}>{title}</h3>
      <div className="space-y-4">
        <p className="text-slate-800">{contentPreview}</p>
        
        {content.length > 300 && (
          <Button 
            variant="link" 
            className={`${accentColor[topic]} p-0`} 
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? 'Show less' : 'Read more'}
          </Button>
        )}
        
        <CitationList citations={citations} />
        
        <div className="mt-4">
          <Button 
            variant="outline" 
            size="sm"
            className="flex items-center gap-1.5"
            onClick={() => onAskFollowUp(title)}
          >
            <MessageCircle className="h-4 w-4" />
            Ask a follow-up
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ExpertResponse;
