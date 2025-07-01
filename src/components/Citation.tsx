
import React from 'react';
import { Separator } from "@/components/ui/separator";

export interface CitationProps {
  source: string;
  title: string;
  url: string;
}

const Citation: React.FC<CitationProps> = ({ source, title, url }) => {
  return (
    <div className="text-sm mt-2 pt-1">
      <a 
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1 text-blue-600 hover:underline"
      >
        <span className="font-medium">{source}</span>
        <span className="text-muted-foreground">— {title}</span>
      </a>
    </div>
  );
};

export const CitationList: React.FC<{ citations: CitationProps[] }> = ({ citations }) => {
  if (citations.length === 0) return null;
  
  return (
    <div className="mt-4 pt-2">
      <Separator className="mb-2" />
      <h4 className="text-sm font-medium mb-2">Sources</h4>
      <div className="space-y-1">
        {citations.map((citation, index) => (
          <Citation key={index} {...citation} />
        ))}
      </div>
    </div>
  );
};

export default Citation;
