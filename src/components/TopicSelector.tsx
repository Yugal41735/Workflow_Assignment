
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export type TopicType = 'tech' | 'health' | 'finance';

interface TopicSelectorProps {
  selectedTopic: TopicType;
  onTopicChange: (topic: TopicType) => void;
  disabled?: boolean;
}

const TopicSelector: React.FC<TopicSelectorProps> = ({ selectedTopic, onTopicChange, disabled }) => {
  return (
    <div className="flex flex-col items-center gap-2 mb-8">
      <label className="text-sm font-medium text-muted-foreground">Select Topic Area</label>
      <Select 
        value={selectedTopic} 
        onValueChange={(value) => onTopicChange(value as TopicType)} 
        disabled={disabled}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Select Topic" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="tech">Technology</SelectItem>
          <SelectItem value="health">Health & Wellness</SelectItem>
          <SelectItem value="finance">Finance & Economics</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};

export default TopicSelector;
