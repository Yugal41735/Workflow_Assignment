
import { CitationProps } from "@/components/Citation";
import { TopicType } from "@/components/TopicSelector";

// Replace this with your Perplexity API key or get it from env variables
let PERPLEXITY_API_KEY: string | null = null;

interface ExpertResponse {
  title: string;
  content: string;
  citations: CitationProps[];
}

interface PerplexityMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export const setPerplexityApiKey = (key: string) => {
  PERPLEXITY_API_KEY = key;
};

export const getPerplexityApiKey = () => {
  return PERPLEXITY_API_KEY;
};

// Helper function to parse citations from the response
const parseCitations = (text: string): { content: string; citations: CitationProps[] } => {
  const citations: CitationProps[] = [];
  // Remove citation part from content for cleaner display
  let cleanContent = text;
  
  // Match patterns like [1]: Title - Source (URL)
  const citationRegex = /\[(\d+)\]:\s*(.*?)\s*-\s*(.*?)\s*\((https?:\/\/[^\s)]+)\)/g;
  let match;
  
  while ((match = citationRegex.exec(text)) !== null) {
    citations.push({
      source: match[3],
      title: match[2],
      url: match[4]
    });
    
    // Remove the citation from the content
    cleanContent = cleanContent.replace(match[0], '');
  }
  
  // Clean up any remaining citation references like [1], [2], etc.
  cleanContent = cleanContent.replace(/\[\d+\]/g, '').trim();
  
  return { content: cleanContent, citations };
};

// Parse the entire response from Perplexity into separate expert responses
const parseExpertPanelResponse = (response: string): ExpertResponse[] => {
  const expertSections = response.split(/Expert \d+:/);
  // Remove the first empty section if it exists
  if (expertSections[0].trim() === '') {
    expertSections.shift();
  }
  
  return expertSections.map((section, index) => {
    // Extract expert title and remove it from content
    const titleMatch = section.match(/^(.*?)\n/);
    const expertTitle = titleMatch ? titleMatch[1].trim() : `Expert ${index + 1}`;
    let content = section.replace(/^(.*?)\n/, '').trim();
    
    // Parse citations from content
    const { content: cleanContent, citations } = parseCitations(content);
    
    return {
      title: expertTitle,
      content: cleanContent,
      citations
    };
  });
};

// Generate a prompt for the expert panel based on the question and topic
const generatePanelPrompt = (question: string, topic: TopicType): string => {
  let topicDescription = '';
  
  switch(topic) {
    case 'tech':
      topicDescription = 'technology, computing, AI, digital trends';
      break;
    case 'health':
      topicDescription = 'health, medicine, wellness, fitness, nutrition';
      break;
    case 'finance':
      topicDescription = 'finance, economics, investing, business, money management';
      break;
  }

  return `
Act as a panel of 4 different experts who each have different perspectives and expertise related to ${topicDescription}.

For the question: "${question}"

Please provide 4 separate expert responses. For each expert:
1. Start with "Expert 1: [Expert Title]" (and so on for experts 2-4)
2. Write a detailed, informative response from that expert's perspective
3. Each expert should have a different background and offer a unique viewpoint
4. For each expert, include 2 citations in the following format at the end of their response:
   [1]: Title - Source (URL)
   [2]: Title - Source (URL)

The citations should be real, relevant sources that support the expert's points.

Format the entire response clearly with line breaks between different experts' responses.
`;
};

// Generate a prompt for continued conversation with a specific expert
const generateExpertChatPrompt = (question: string, expertTitle: string, previousMessages: { sender: string, content: string }[]): string => {
  const conversationHistory = previousMessages
    .map(msg => {
      if (msg.sender === 'user') {
        return `User: ${msg.content}`;
      } else {
        return `${expertTitle}: ${msg.content}`;
      }
    })
    .join('\n\n');

  return `
Act as a ${expertTitle} responding to a follow-up question.

Previous conversation:
${conversationHistory}

User's new question: "${question}"

Please answer as the ${expertTitle}. Your response should be detailed, informative, and in your expert voice.
Include at least 2 citations in the following format at the end of your response:
[1]: Title - Source (URL)
[2]: Title - Source (URL)

The citations should be real, relevant sources that support your points.
`;
};

// Function to get initial expert panel responses (non-streaming)
export const getExpertPanelResponse = async (question: string, topic: TopicType): Promise<ExpertResponse[]> => {
  if (!PERPLEXITY_API_KEY) {
    throw new Error("Perplexity API key is not set");
  }
  
  const prompt = generatePanelPrompt(question, topic);
  
  const messages: PerplexityMessage[] = [
    {
      role: 'system',
      content: 'You are a helpful assistant providing multiple expert perspectives on user questions.'
    },
    {
      role: 'user',
      content: prompt
    }
  ];
  
  try {
    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${PERPLEXITY_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.1-sonar-small-128k-online',
        messages,
        temperature: 0.2,
        max_tokens: 4000,
        return_images: false,
        return_related_questions: false,
        search_domain_filter: ['perplexity.ai'],
        search_recency_filter: 'month',
      }),
    });
    
    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }
    
    const data = await response.json();
    const content = data.choices[0]?.message?.content;
    
    if (!content) {
      throw new Error("No content returned from API");
    }
    
    return parseExpertPanelResponse(content);
  } catch (error) {
    console.error("Error fetching from Perplexity API:", error);
    throw error;
  }
};

// Function to get a streaming expert response for follow-up questions
export const getExpertChatResponse = async (
  question: string,
  expertTitle: string,
  previousMessages: { sender: string, content: string }[],
  onChunk: (chunk: string) => void
): Promise<{ content: string; citations: CitationProps[] }> => {
  if (!PERPLEXITY_API_KEY) {
    throw new Error("Perplexity API key is not set");
  }
  
  const prompt = generateExpertChatPrompt(question, expertTitle, previousMessages);
  
  const messages: PerplexityMessage[] = [
    {
      role: 'system',
      content: `You are a ${expertTitle} responding to follow-up questions. Always include citations.`
    },
    {
      role: 'user',
      content: prompt
    }
  ];
  
  try {
    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${PERPLEXITY_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.1-sonar-small-128k-online',
        messages,
        temperature: 0.2,
        max_tokens: 2000,
        return_images: false,
        return_related_questions: false,
        search_domain_filter: ['perplexity.ai'],
        search_recency_filter: 'month',
        stream: true,
      }),
    });
    
    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }
    
    const reader = response.body?.getReader();
    const decoder = new TextDecoder();
    let accumulatedResponse = '';
    
    if (!reader) {
      throw new Error("No response body available");
    }
    
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      
      const chunk = decoder.decode(value, { stream: true });
      
      // Parse SSE chunks
      const lines = chunk.split('\n');
      for (const line of lines) {
        if (line.startsWith('data: ') && line !== 'data: [DONE]') {
          try {
            const jsonData = JSON.parse(line.slice(6));
            const textChunk = jsonData.choices[0]?.delta?.content || '';
            if (textChunk) {
              accumulatedResponse += textChunk;
              onChunk(textChunk);
            }
          } catch (e) {
            console.error('Error parsing SSE chunk:', e);
          }
        }
      }
    }
    
    // Parse citations from the accumulated response
    return parseCitations(accumulatedResponse);
  } catch (error) {
    console.error("Error fetching from Perplexity API:", error);
    throw error;
  }
};
