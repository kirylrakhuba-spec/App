import { Module } from '@nestjs/common';
import { PostService } from './post.service';
import { PostController } from './post.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Post } from '@/database/entities/post.entity';
import { Profile } from '@/database/entities/profile.entity';
import { AuthModule } from '@/auth/auth.module';

import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { v4 as uuidv4 } from 'uuid'
import { extname } from 'path';

@Module({
  imports: [
    TypeOrmModule.forFeature([Post, Profile]),
    AuthModule,

  MulterModule.register({
    storage: diskStorage({
      destination: './uploads',
      filename(req, file, cd) {
        const randomName = uuidv4();
        const extension = extname(file.originalname);
        cd(null,`${randomName}${extension}`)
      },
    })
  })
  ],
  controllers: [PostController],
  providers: [PostService],
})
export class PostModule {}
