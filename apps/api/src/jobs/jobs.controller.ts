import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import { IsIn, IsObject, IsOptional, IsString, MaxLength } from 'class-validator';
import { JobsService } from './jobs.service';
import { JwtGuard, OptionalAuth, type JwtPayload } from '../auth/jwt.guard';

const SERVER_TOOLS = ['compress-pdf', 'pdf-to-jpg', 'jpg-to-pdf'];

class CreateJobDto {
  @IsString()
  @IsIn(SERVER_TOOLS)
  tool!: string;

  @IsString()
  @MaxLength(512)
  key!: string;

  @IsOptional()
  @IsObject()
  options?: Record<string, unknown>;
}

@Controller('jobs')
@UseGuards(JwtGuard)
export class JobsController {
  constructor(private readonly jobs: JobsService) {}

  @Post()
  @OptionalAuth()
  create(@Body() body: CreateJobDto, @Req() req: Request & { user?: JwtPayload }) {
    return this.jobs.create({
      tool: body.tool,
      key: body.key,
      options: body.options,
      userId: req.user?.sub,
    });
  }

  @Get(':id')
  @OptionalAuth()
  get(@Param('id') id: string) {
    return this.jobs.get(id);
  }

  @Get()
  async mine(@Req() req: Request & { user?: JwtPayload }) {
    if (!req.user) return { jobs: [] };
    const jobs = await this.jobs.listForUser(req.user.sub);
    return {
      jobs: jobs.map((j) => ({
        id: j.id,
        tool: j.tool,
        state: j.state,
        outputName: j.outputName,
        createdAt: j.createdAt,
        expiresAt: j.expiresAt,
      })),
    };
  }
}
