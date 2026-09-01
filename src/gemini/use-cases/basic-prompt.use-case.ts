import { GoogleGenAI } from '@google/genai';
import { BasicPromptDto } from '../dtos/basic-prompt.dto';

interface Options {
  model?: string;
  systemInstruction?: string;
}

export const basicPromptUseCase = async (
  ai: GoogleGenAI,
  basicPromptDto: BasicPromptDto,
  options?: Options,
) => {
  const {
    model = 'gemini-3.6-flash',
    systemInstruction = `Responde únicamente en español, en formato markdown, usa negritas de esta forma __, usa el sistema métrico decimal`,
  } = options ?? {};
  const interaction = await ai.interactions.create({
    model: model,
    input: basicPromptDto.prompt,
    system_instruction: systemInstruction,
  });

  return interaction.output_text;
};
