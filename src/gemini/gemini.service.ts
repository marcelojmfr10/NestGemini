import { Injectable } from '@nestjs/common';
import { BasicPromptDto } from './dtos/basic-prompt.dto';

import { GoogleGenAI, Interactions } from '@google/genai';
import { basicPromptUseCase } from './use-cases/basic-prompt.use-case';
import { basicPromptStreamUseCase } from './use-cases/basic-prompt-stream.use-case';
import { ChatPromptDto } from './dtos/chat-prompt.dto';
import { chatPromptStreamUseCase } from './use-cases/chat-prompt-stream.use-case';

// Solo guardamos los turnos de la conversación, no los steps de herramientas
export type ChatMessage =
  | Interactions.UserInputStep
  | Interactions.ModelOutputStep;

@Injectable()
export class GeminiService {
  private ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

  private chatHistory = new Map<string, ChatMessage[]>();

  async basicPrompt(basicPromptDto: BasicPromptDto) {
    return basicPromptUseCase(this.ai, basicPromptDto);
  }

  async basicPromptStream(basicPromptDto: BasicPromptDto) {
    return basicPromptStreamUseCase(this.ai, basicPromptDto);
  }

  async chatStream(chatPromptDto: ChatPromptDto) {
    const chatHistory = this.getChatHistory(chatPromptDto.chatId);
    return chatPromptStreamUseCase(this.ai, chatPromptDto, {
      history: chatHistory,
    });
  }

  saveMessage(chatId: string, message: ChatMessage) {
    const messages = this.getChatHistory(chatId);
    messages.push(message);
    this.chatHistory.set(chatId, messages);
  }

  getChatHistory(chatId: string) {
    // clonar objeto y romper la referencia
    return structuredClone(this.chatHistory.get(chatId) ?? []);
  }
}
