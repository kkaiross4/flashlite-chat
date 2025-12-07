import { GoogleGenAI, Chat, GenerateContentResponse } from "@google/genai";
import { MODEL_NAME, INITIAL_SYSTEM_INSTRUCTION } from "../constants";

// Ensure API key is present
const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  console.error("API_KEY is missing from environment variables.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

export class GeminiService {
  private chatSession: Chat | null = null;

  constructor() {
    this.initChat();
  }

  private initChat() {
    this.chatSession = ai.chats.create({
      model: MODEL_NAME,
      config: {
        systemInstruction: INITIAL_SYSTEM_INSTRUCTION,
      },
    });
  }

  public resetChat() {
    this.initChat();
  }

  public async *sendMessageStream(message: string): AsyncGenerator<string, void, unknown> {
    if (!this.chatSession) {
      this.initChat();
    }

    try {
      const result = await this.chatSession!.sendMessageStream({ message });

      for await (const chunk of result) {
        const c = chunk as GenerateContentResponse;
        if (c.text) {
          yield c.text;
        }
      }
    } catch (error) {
      console.error("Error in Gemini stream:", error);
      throw error;
    }
  }
}

// Export a singleton instance for simplicity in this specific app structure
export const geminiService = new GeminiService();
