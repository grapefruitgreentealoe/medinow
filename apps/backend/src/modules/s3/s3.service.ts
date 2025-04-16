import { Injectable, BadRequestException } from '@nestjs/common';
import { AwsConfigService } from '../../config/aws/config.service';
import {
  PutObjectCommand,
  S3Client,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { Express } from 'express';
import { Buffer } from 'buffer';

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
    const date = new Date();
    const buffer = Buffer.from(file.originalname, 'latin1');
    const originalName = buffer.toString('utf8');
    const fileName = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}-${dirPath}/${originalName}`;
    const uploadParams = {
      Bucket: this.awsConfigService.awsBucketName,
      Key: fileName,
      Body: file.buffer,
      ContentType: file.mimetype,
    };
    await this.s3.send(new PutObjectCommand(uploadParams));
    return `https://${this.awsConfigService.awsBucketName}.s3.${this.awsConfigService.awsRegion}.amazonaws.com/${fileName}`;
  }

  async deleteFile(filePath: string) {
    try {
      // filePath가 전체 URL인 경우 키 추출
      let key = filePath;
      if (filePath.startsWith('https://')) {
        // URL에서 키 부분만 추출
        // 예: https://bucket-name.s3.region.amazonaws.com/path/to/file.jpg -> path/to/file.jpg
        const urlParts = filePath.split('.com/');
        if (urlParts.length > 1) {
          key = urlParts[1];
        }
      }

      const deleteParams = {
        Bucket: this.awsConfigService.awsBucketName,
        Key: key,
      };

      await this.s3.send(new DeleteObjectCommand(deleteParams));
      return true;
    } catch (error: any) {
      console.error('S3 파일 삭제 중 오류 발생:', error);
      throw new BadRequestException('파일 삭제 실패: ' + error.message);
    }
  }
}
