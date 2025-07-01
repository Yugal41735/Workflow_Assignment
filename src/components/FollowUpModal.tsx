
import React, { useState, KeyboardEvent } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Send } from "lucide-react";

interface FollowUpModalProps {
  isOpen: boolean;
  expertTitle: string | null;
  onClose: () => void;
  onSubmit: (question: string) => void;
  isLoading: boolean;
}

const FollowUpModal: React.FC<FollowUpModalProps> = ({ 
  isOpen, 
  expertTitle, 
  onClose, 
  onSubmit,
  isLoading 
}) => {
  const [followUpQuestion, setFollowUpQuestion] = useState('');

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && followUpQuestion.trim() !== '') {
      handleSubmit();
    }
  };

  const handleSubmit = () => {
    if (followUpQuestion.trim() !== '') {
      onSubmit(followUpQuestion);
      setFollowUpQuestion('');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) onClose();
      // Reset the question when the modal closes
      if (!open) setFollowUpQuestion('');
    }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Ask a follow-up question</DialogTitle>
          <DialogDescription>
            {expertTitle ? `Direct your question to the ${expertTitle}` : 'Ask an expert for more information'}
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex items-center space-x-2 mt-4">
          <Input
            placeholder="What else would you like to know?"
            value={followUpQuestion}
            onChange={(e) => setFollowUpQuestion(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
            className="flex-1"
            autoFocus
          />
        </div>
        
        <DialogFooter className="sm:justify-start">
          <div className="flex gap-2 mt-2">
            <Button 
              onClick={handleSubmit} 
              disabled={isLoading || followUpQuestion.trim() === ''}
            >
              <Send className="h-4 w-4 mr-1" />
              {isLoading ? 'Sending...' : 'Ask'}
            </Button>
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default FollowUpModal;
