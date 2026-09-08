import { GoogleGenAI } from '@google/genai';
import { geminiUploadFiles } from '../helpers/gemini-upload-file';
import { ImageGenerationDto } from '../dtos/image-generation.dto';

interface Options {
  model?: string;
  systemInstruction?: string;
}

export interface ImageGenerationResponse {
  imageUrl: string;
  text: string;
}

export const imageGenerationUseCase = async (
  ai: GoogleGenAI,
  imageGenerationDto: ImageGenerationDto,
  options?: Options,
): Promise<ImageGenerationResponse> => {
  const { prompt, files = [] } = imageGenerationDto;
  const uploadedFiles = await geminiUploadFiles(ai, files);

  const {
    model = 'gemini-3.6-flash',
    systemInstruction = `Responde únicamente en español, en formato markdown,
    usa negritas de esta forma __, usa el sistema métrico decimal`,
  } = options ?? {};

  return {
    imageUrl: 'xxx',
    text: 'ddd',
  };
};
