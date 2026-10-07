import { BadRequestException, Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import type { Request } from 'express';
import { IsIn, IsInt, IsString, Max, Min, MaxLength } from 'class-validator';
import { ACCEPTED_MIME } from '@alldocs/config';
import { StorageService } from '../storage/storage.service';
import { config } from '../config';
import { JwtGuard, OptionalAuth, type JwtPayload } from '../auth/jwt.guard';

const SERVER_TOOLS = ['compress-pdf', 'pdf-to-jpg', 'jpg-to-pdf'] as const;

class SignUploadDto {
  @IsString()
  @IsIn(SERVER_TOOLS as unknown as string[])
  tool!: string;

  @IsString()
  @MaxLength(255)
  filename!: string;

  @IsString()
  @MaxLength(100)
  contentType!: string;

  @IsInt()
  @Min(1)
  @Max(5 * 1024 * 1024 * 1024)
  size!: number;
}

@Controller('uploads')
@UseGuards(JwtGuard)
export class UploadsController {
  constructor(private readonly storage: StorageService) {}

  @Post('sign')
  @OptionalAuth() // free tier: signup optional
  async sign(@Body() body: SignUploadDto, @Req() req: Request & { user?: JwtPayload }) {
    // 1. Enforce per-tool MIME allowlist (defense in depth; worker re-checks magic bytes).
    const allowed = ACCEPTED_MIME[body.tool];
    if (!allowed || !allowed.includes(body.contentType)) {
      throw new BadRequestException(
        `${body.contentType} is not accepted for ${body.tool}.`,
      );
    }

    // 2. Enforce size cap by tier.
    const cap = req.user?.tier === 'pro' ? 2 * 1024 * 1024 * 1024 : config.limits.maxUploadBytes;
    if (body.size > cap) {
      throw new BadRequestException(
        `File is too large. Limit is ${Math.round(cap / 1024 / 1024)} MB on your plan.`,
      );
    }

    // 3. Namespaced, unguessable key under an inputs/ prefix (lifecycle-purged).
    const ext = extFor(body.contentType);
    const key = `inputs/${new Date().toISOString().slice(0, 10)}/${crypto.randomUUID()}${ext}`;
    const uploadUrl = await this.storage.signUpload(key, body.contentType);

    return { uploadUrl, key, method: 'PUT' as const };
  }
}

function extFor(mime: string): string {
  switch (mime) {
    case 'application/pdf':
      return '.pdf';
    case 'image/jpeg':
      return '.jpg';
    case 'image/png':
      return '.png';
    default:
      return '';
  }
}
