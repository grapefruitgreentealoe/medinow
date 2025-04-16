import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AwsConfigService {
  constructor(private configService: ConfigService) {}

  get awsAccessKeyId() {
    return this.configService.get<string>('aws.awsAccessKeyId');
  }

  get awsSecretAccessKey() {
    return this.configService.get<string>('aws.awsSecretAccessKey');
  }

  get awsBucketName() {
    return this.configService.get<string>('aws.awsBucketName');
  }
  get awsRegion() {
    return this.configService.get<string>('aws.awsRegion');
  }
}
