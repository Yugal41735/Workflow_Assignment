
import React, { useState, KeyboardEvent } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface QuestionInputProps {
  onSubmit: (question: string) => void;
  isLoading: boolean;
}

const QuestionInput: React.FC<QuestionInputProps> = ({ onSubmit, isLoading }) => {
  const [question, setQuestion] = useState('');

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && question.trim() !== '') {
      handleSubmit();
    }
  };

  const handleSubmit = () => {
    if (question.trim() !== '') {
      onSubmit(question);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="flex items-center gap-2">
        <div className="relative flex-grow">
          <Input
            className="pr-10 py-6 text-lg border-2 focus-visible:ring-2"
            placeholder="Ask any question..."
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
          />
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <Search className="h-5 w-5 text-muted-foreground" />
          </div>
        </div>
        <Button 
          className="py-6 px-8" 
          onClick={handleSubmit} 
          disabled={isLoading || question.trim() === ''}
        >
          {isLoading ? 'Consulting...' : 'Ask Experts'}
        </Button>
      </div>
    </div>
  );
};

export default QuestionInput;
