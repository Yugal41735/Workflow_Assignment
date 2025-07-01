
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Key } from "lucide-react";
import { getPerplexityApiKey, setPerplexityApiKey } from '@/services/perplexityService';

interface ApiKeyInputProps {
  onApiKeySet: () => void;
}

const ApiKeyInput: React.FC<ApiKeyInputProps> = ({ onApiKeySet }) => {
  const [apiKey, setApiKey] = useState('');
  const [isKeySet, setIsKeySet] = useState(false);

  useEffect(() => {
    // Check if API key is already set
    const existingKey = localStorage.getItem('perplexity_api_key') || getPerplexityApiKey();
    if (existingKey) {
      setPerplexityApiKey(existingKey);
      setIsKeySet(true);
      onApiKeySet();
    }
  }, [onApiKeySet]);

  const handleSaveKey = () => {
    if (apiKey.trim()) {
      localStorage.setItem('perplexity_api_key', apiKey);
      setPerplexityApiKey(apiKey);
      setIsKeySet(true);
      onApiKeySet();
    }
  };

  const handleResetKey = () => {
    localStorage.removeItem('perplexity_api_key');
    setPerplexityApiKey('');
    setApiKey('');
    setIsKeySet(false);
  };

  if (isKeySet) {
    return (
      <div className="flex items-center gap-2 mb-4">
        <div className="flex-1 bg-green-50 text-green-700 px-3 py-2 rounded-md text-sm flex items-center">
          <Key className="h-4 w-4 mr-2" />
          <span>Perplexity API key is set</span>
        </div>
        <Button variant="outline" size="sm" onClick={handleResetKey}>
          Reset Key
        </Button>
      </div>
    );
  }

  return (
    <div className="mb-8 p-4 border rounded-md bg-amber-50">
      <h3 className="text-base font-medium mb-2">Perplexity API Key Required</h3>
      <p className="text-sm text-muted-foreground mb-4">
        To use the expert panel, please enter your Perplexity API key. The key is stored only in your browser.
      </p>
      <div className="flex gap-2">
        <Input
          type="password"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          placeholder="Enter your Perplexity API key"
          className="flex-1"
        />
        <Button onClick={handleSaveKey} disabled={!apiKey.trim()}>
          Save Key
        </Button>
      </div>
    </div>
  );
};

export default ApiKeyInput;
