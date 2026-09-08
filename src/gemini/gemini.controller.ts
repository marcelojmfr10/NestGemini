import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  Post,
  Res,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { GeminiService } from './gemini.service';
import { BasicPromptDto } from './dtos/basic-prompt.dto';
import type { Response } from 'express';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ChatPromptDto } from './dtos/chat-prompt.dto';
import { Interactions, Stream } from '@google/genai';
import { ImageGenerationDto } from './dtos/image-generation.dto';

@Controller('gemini')
export class GeminiController {
  constructor(private readonly geminiService: GeminiService) {}

  async outputStreamResponse(
    res: Response,
    stream: Stream<Interactions.InteractionSSEEvent>,
  ) {
    res.setHeader('Content-Type', 'text/plain');
    res.status(HttpStatus.OK);

    let resultText = '';
    for await (const event of stream) {
      if (event.event_type === 'step.delta' && event.delta.type === 'text') {
        const piece = event.delta.text;
        resultText += piece;
        res.write(piece);
      }
    }

    res.end();
    return resultText;
  }

  @Post('basic-prompt')
  async basicPrompt(@Body() basicPromptDto: BasicPromptDto) {
    return this.geminiService.basicPrompt(basicPromptDto);
  }

  @Post('basic-prompt-stream')
  @UseInterceptors(FilesInterceptor('files'))
  async basicPromptStream(
    @Body() basicPromptDto: BasicPromptDto,
    @Res() res: Response,
    @UploadedFiles() files: Array<Express.Multer.File>,
  ) {
    basicPromptDto.files = files;
    const stream = await this.geminiService.basicPromptStream(basicPromptDto);
    void this.outputStreamResponse(res, stream);
  }

  @Post('chat-stream')
  @UseInterceptors(FilesInterceptor('files'))
  async chatStream(
    @Body() chatPromptDto: ChatPromptDto,
    @Res() res: Response,
    @UploadedFiles() files: Array<Express.Multer.File>,
  ) {
    chatPromptDto.files = files;
    const stream = await this.geminiService.chatStream(chatPromptDto);
    const data = await this.outputStreamResponse(res, stream);

    const userMessage: Interactions.UserInputStep = {
      type: 'user_input',
      content: [{ type: 'text', text: chatPromptDto.prompt }],
    };

    const geminiMessage: Interactions.ModelOutputStep = {
      type: 'model_output',
      content: [{ type: 'text', text: data }],
    };

    this.geminiService.saveMessage(chatPromptDto.chatId, userMessage);
    this.geminiService.saveMessage(chatPromptDto.chatId, geminiMessage);
  }

  @Get('chat-history/:chatId')
  getChatHistory(@Param('chatId') chatId: string) {
    return this.geminiService.getChatHistory(chatId).map((step) => ({
      role: step.type === 'user_input' ? 'user' : 'model',
      parts: (step.content ?? [])
        .filter((content) => content.type === 'text')
        .map((content) => content.text)
        .join(' '),
    }));
  }

  @Post('image-generation')
  @UseInterceptors(FilesInterceptor('files'))
  async imageGeneration(
    @Body() imageGenerationDto: ImageGenerationDto,
    @UploadedFiles() files: Array<Express.Multer.File>,
  ) {
    imageGenerationDto.files = files;

    const { imageUrl, text } =
      await this.geminiService.imageGeneration(imageGenerationDto);

    return {
      imageUrl,
      text,
    };
  }
}
