import { Injectable, BadRequestException } from '@nestjs/common';
import { AwsConfigService } from '../../config/aws/config.service';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { Express } from 'express';

@Injectable()
export class S3Service {
  private s3: S3Client;

  constructor(private awsConfigService: AwsConfigService) {
    this.s3 = new S3Client({
      region: this.awsConfigService.awsRegion,
      credentials: {
        accessKeyId: this.awsConfigService.awsAccessKeyId!,
        secretAccessKey: this.awsConfigService.awsSecretAccessKey!,
      },
    });
  }
  async uploadFile(file: Express.Multer.File, dirPath: string) {
    if (!file) {
      throw new BadRequestException('파일이 없습니다.');
    }
    const fileName = `${Date.now()}-${file.originalname}`;
    const key = `${dirPath}/${fileName.toString()}`;
    const uploadParams = {
      Bucket: this.awsConfigService.awsBucketName,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
    };
    await this.s3.send(new PutObjectCommand(uploadParams));
    return `https://${this.awsConfigService.awsBucketName}.s3.${this.awsConfigService.awsRegion}.amazonaws.com/${key}`;
  }
}
