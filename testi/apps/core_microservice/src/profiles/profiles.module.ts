import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Profile } from '../database/entities/profile.entity';
import { ProfilesController } from './profiles.controller';
import { ProfilesService } from './profiles.service';
import { AuthModule } from '@/auth/auth.module';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';

import { v4 as uuidv4 } from 'uuid';
import { extname } from 'path';


@Module({
  imports: [AuthModule,TypeOrmModule.forFeature([Profile]),

  MulterModule.register({
    storage: diskStorage({
      filename: (req, file, cd) =>{
        const randomName = uuidv4()
        const extension = extname(file.originalname)
        cd(null, `${randomName}${extension}`)
      }
    })
  })
  ],
  controllers: [ProfilesController],
  providers: [ProfilesService],
  exports: [ProfilesService],
})
export class ProfilesModule {}
