import { Module, forwardRef } from '@nestjs/common';
import { FavoritesService } from './favorites.service';
import { FavoritesController } from './favorites.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Favorite } from './entities/favorite.entity';
import { UsersModule } from '../users/users.module';
import { CareUnitModule } from '../care-units/care-unit.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Favorite]),
    forwardRef(() => UsersModule),
    forwardRef(() => CareUnitModule),
  ],
  controllers: [FavoritesController],
  providers: [FavoritesService],
  exports: [FavoritesService],
})
export class FavoritesModule {}
