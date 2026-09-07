import { Content, createPartFromUri, GoogleGenAI } from '@google/genai';
import { ChatPromptDto } from '../dtos/chat-prompt.dto';
import { geminiUploadFiles } from '../helpers/gemini-upload-file';

interface Options {
  model?: string;
  systemInstruction?: string;
  history: Content[];
}

export const chatPromptStreamUseCase = async (
  ai: GoogleGenAI,
  chatPromptDto: ChatPromptDto,
  options?: Options,
) => {
  const { prompt, files = [] } = chatPromptDto;
  const uploadedFiles = await geminiUploadFiles(ai, files);

  const {
    history = [],
    model = 'gemini-3.6-flash',
    systemInstruction = `Responde únicamente en español, en formato markdown, 
    usa negritas de esta forma __, usa el sistema métrico decimal`,
  } = options ?? {};

  const chat = ai.chats.create({
    model,
    config: {
      systemInstruction,
    },
    history,
  });

  return chat.sendMessage({
    message: [
      prompt,
      ...uploadedFiles.map((file) =>
        createPartFromUri(file.uri ?? '', file.mimeType ?? ''),
      ),
    ],
  });
};
