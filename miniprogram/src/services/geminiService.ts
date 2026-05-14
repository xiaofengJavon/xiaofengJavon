import { ChatMessage } from "../types";
import { PRESET_AI_RESPONSES } from "../constants";

// Helper to delay (simulate network)
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const GeminiService = {
  /**
   * Chat with context (RAG-like)
   */
  async chatWithContext(history: ChatMessage[], context: string, userPrompt: string): Promise<string> {
    // Mock Implementation
    await delay(1000 + Math.random() * 1000);
    
    // Simple keyword matching for better fake responses
    const lowerPrompt = userPrompt.toLowerCase();
    let responses = PRESET_AI_RESPONSES.general;
    
    if (lowerPrompt.includes('政策') || lowerPrompt.includes('法规') || lowerPrompt.includes('解读')) {
      responses = PRESET_AI_RESPONSES.policy;
    } else if (lowerPrompt.includes('产业') || lowerPrompt.includes('技术') || lowerPrompt.includes('市场')) {
      responses = PRESET_AI_RESPONSES.industry;
    }

    return responses[Math.floor(Math.random() * responses.length)];
  }
};
