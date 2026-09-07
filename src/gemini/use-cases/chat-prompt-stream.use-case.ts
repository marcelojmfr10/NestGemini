import { createUserContent, GoogleGenAI } from '@google/genai';
import { BasicPromptDto } from '../dtos/basic-prompt.dto';
import { ChatPromptDto } from '../dtos/chat-prompt.dto';

interface Options {
  model?: string;
  systemInstruction?: string;
}

export const chatPromptStreamUseCase = async (
  ai: GoogleGenAI,
  chatPromptDto: ChatPromptDto,
  options?: Options,
) => {
  const { prompt, files = [] } = chatPromptDto;

  const images = await Promise.all(
    files.map(async (file) => {
      return await ai.files.upload({
        file: new Blob([file.buffer], {
          type: file.mimetype.includes('image') ? file.mimetype : 'image/jpg',
        }),
      });
    }),
  );

  const {
    model = 'gemini-3.6-flash',
    systemInstruction = `Responde únicamente en español, en formato markdown, usa negritas de esta forma __, usa el sistema métrico decimal`,
  } = options ?? {};

  return '';
};
