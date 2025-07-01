
import React from 'react';
import ExpertResponse, { ExpertResponseProps } from "@/components/ExpertResponse";
import { TopicType } from "@/components/TopicSelector";

interface ExpertPanelProps {
  responses: Omit<ExpertResponseProps, 'onAskFollowUp' | 'topic'>[];
  topic: TopicType;
  onAskFollowUp: (expertTitle: string) => void;
}

const ExpertPanel: React.FC<ExpertPanelProps> = ({ responses, topic, onAskFollowUp }) => {
  if (!responses || responses.length === 0) {
    return null;
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {responses.map((response, index) => (
          <ExpertResponse
            key={index}
            {...response}
            topic={topic}
            onAskFollowUp={onAskFollowUp}
          />
        ))}
      </div>
    </div>
  );
};

export default ExpertPanel;
