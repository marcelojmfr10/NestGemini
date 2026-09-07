import { GoogleGenAI, Interactions } from '@google/genai';
import { ChatPromptDto } from '../dtos/chat-prompt.dto';
import { geminiUploadFiles } from '../helpers/gemini-upload-file';

interface Options {
  model?: string;
  systemInstruction?: string;
  history?: Interactions.Step[];
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

  // El turno actual del usuario: el texto más los archivos ya subidos
  const userInput: Interactions.UserInputStep = {
    type: 'user_input',
    content: [
      {
        type: 'text',
        text: prompt,
      },
      ...uploadedFiles.map<Interactions.Content>((file) => {
        const mimeType = file.mimeType ?? '';

        return mimeType.startsWith('image/')
          ? { type: 'image', uri: file.uri, mime_type: mimeType }
          : { type: 'document', uri: file.uri, mime_type: mimeType };
      }),
    ],
  };

  // El historial se envía como una lista de steps (user_input / model_output)
  const stream = await ai.interactions.create({
    model: model,
    input: [...history, userInput],
    system_instruction: systemInstruction,
    stream: true,
  });

  return stream;
};
