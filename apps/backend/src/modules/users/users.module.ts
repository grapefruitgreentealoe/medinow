import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UserSubscriber } from './subscribers/user.subscriber';
import { UserProfile } from './entities/user-profile.entity';
import { ImagesModule } from '../images/images.module';
import { CareUnitModule } from '../care-units/care-unit.module';
@Module({
  imports: [
    TypeOrmModule.forFeature([User, UserProfile]),
    ImagesModule,
    CareUnitModule,
  ],
  controllers: [UsersController],
  providers: [UsersService, UserSubscriber],
  exports: [UsersService],
})
export class UsersModule {}
