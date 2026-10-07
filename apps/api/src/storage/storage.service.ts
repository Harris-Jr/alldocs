import { Injectable } from '@nestjs/common';
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { config } from '../config';

/**
 * Object storage wrapper (S3 / MinIO). We never stream file bytes through the
 * API — the browser PUTs directly to a signed URL, and downloads via a signed
 * GET. Lifecycle rules on the bucket enforce auto-purge (see infra/README).
 */
@Injectable()
export class StorageService {
  private readonly s3: S3Client;
  private readonly publicS3: S3Client;

  constructor() {
    this.s3 = new S3Client({
      endpoint: config.s3.endpoint,
      region: config.s3.region,
      forcePathStyle: config.s3.forcePathStyle,
      credentials: {
        accessKeyId: config.s3.accessKeyId,
        secretAccessKey: config.s3.secretAccessKey,
      },
    });
    // A second client bound to the browser-reachable endpoint, so signed URLs
    // handed to the client resolve from outside the docker network.
    this.publicS3 = new S3Client({
      endpoint: config.s3.publicEndpoint,
      region: config.s3.region,
      forcePathStyle: config.s3.forcePathStyle,
      credentials: {
        accessKeyId: config.s3.accessKeyId,
        secretAccessKey: config.s3.secretAccessKey,
      },
    });
  }

  /** Signed PUT URL for direct browser upload. */
  async signUpload(key: string, contentType: string): Promise<string> {
    const cmd = new PutObjectCommand({
      Bucket: config.s3.bucket,
      Key: key,
      ContentType: contentType,
    });
    return getSignedUrl(this.publicS3, cmd, { expiresIn: config.limits.uploadUrlTtl });
  }

  /** Signed GET URL for direct browser download. */
  async signDownload(key: string, filename: string): Promise<string> {
    const cmd = new GetObjectCommand({
      Bucket: config.s3.bucket,
      Key: key,
      ResponseContentDisposition: `attachment; filename="${filename}"`,
    });
    return getSignedUrl(this.publicS3, cmd, { expiresIn: config.limits.downloadUrlTtl });
  }

  /** Confirm an uploaded object exists and get its size (post-upload check). */
  async head(key: string): Promise<{ size: number; contentType?: string } | null> {
    try {
      const res = await this.s3.send(
        new HeadObjectCommand({ Bucket: config.s3.bucket, Key: key }),
      );
      return { size: res.ContentLength ?? 0, contentType: res.ContentType };
    } catch {
      return null;
    }
  }
}
