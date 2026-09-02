import { Body, Controller, Get, HttpStatus, Post, Res } from '@nestjs/common';
import { GeminiService } from './gemini.service';
import { BasicPromptDto } from './dtos/basic-prompt.dto';
import type { Response } from 'express';

@Controller('gemini')
export class GeminiController {
  constructor(private readonly geminiService: GeminiService) {}

  @Post('basic-prompt')
  async basicPrompt(@Body() basicPromptDto: BasicPromptDto) {
    return this.geminiService.basicPrompt(basicPromptDto);
  }

  @Post('basic-prompt-stream')
  async basicPromptStream(
    @Body() basicPromptDto: BasicPromptDto,
    @Res() res: Response,
  ) {
    const stream = await this.geminiService.basicPromptStream(basicPromptDto);
    res.setHeader('Content-Type', 'text/plain');
    res.status(HttpStatus.OK);

    for await (const event of stream) {
      if (event.event_type === 'step.delta' && event.delta?.type === 'text') {
        const piece = event.delta.text;
        res.write(piece);
      }
    }

    res.end();
  }
}
