import { Injectable } from '@nestjs/common';
import { S3 } from '@aws-sdk/client-s3';
import { S3Service } from './../s3/s3.service';
import { Repository } from 'typeorm';
import { Image } from './entities/image.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class ImagesService {
  constructor(
    @InjectRepository(Image)
    private readonly imageRepository: Repository<Image>,
    private readonly s3Service: S3Service,
  ) {}
  async uploadImage(file: Express.Multer.File) {
    // const fileName = `${Date.now()}-${originalname}}`;
    const filePath = `userUploads`;
    const imgUrl = await this.s3Service.uploadFile(file, filePath);
    const image = this.imageRepository.create({
      imgUrl,
      filePath,
    });
    await this.imageRepository.save(image);
    return { imgUrl };
  }

  //   findOne(id: number) {
  //     return `This action returns a #${id} image`;
  //   }

  //   update(id: number) {
  //     return `This action updates a #${id} image`;
  //   }

  //   remove(id: number) {
  //     return `This action removes a #${id} image`;
  //   }
}
