import { createUserContent, GoogleGenAI } from '@google/genai';
import { BasicPromptDto } from '../dtos/basic-prompt.dto';

interface Options {
  model?: string;
  systemInstruction?: string;
}

export const basicPromptStreamUseCase = async (
  ai: GoogleGenAI,
  basicPromptDto: BasicPromptDto,
  options?: Options,
) => {
  const files = basicPromptDto.files;

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
  const stream = await ai.interactions.create({
    model: model,
    // input: basicPromptDto.prompt,
    input: [
      {
        type: 'text',
        text: basicPromptDto.prompt,
      },
      ...images.map((image) => ({
        type: 'image' as const,
        uri: image.uri,
        mime_type: image.mimeType,
      })),
    ],
    system_instruction: systemInstruction,
    stream: true,
  });

  return stream;
};
