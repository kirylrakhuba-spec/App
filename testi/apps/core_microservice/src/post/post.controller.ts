import { BadRequestException, Body, Controller, Delete, Get, Param, Post, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { PostService } from './post.service';
import { ApiBearerAuth, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '@/guards/jwt-auth.guard';

import { CurrentUser } from '@/decorators/current-user.decorator';
import { CreatePostDto } from './dto/create-post.dto';



@ApiTags('Post')
@Controller('posts')
export class PostController {
  constructor(private readonly postService: PostService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @UseInterceptors(FileInterceptor('image'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Create a new post' })
  async createPost(@Body() dto:CreatePostDto , @CurrentUser() user: {id:string}, @UploadedFile() file: Express.Multer.File){
  if(!file){
    throw new BadRequestException('Image is required')
  }
  const fileUrl = `/uploads/${file.filename}`
    return this.postService.createPost(
      user.id,
      { 
        caption: dto.caption,
        imageUrl: fileUrl
      }
    )
  }

  @Get(':id')
  async getPost(@Param('id') id: string){
    return await this.postService.findCurrentPost(id)
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async removePost(@Param('id')id:string,@CurrentUser() user:{id:string}){
    return this.postService.remove(id,user.id)
  }

  @Get()
  @ApiOperation({ summary: 'Get all posts (Feed)' })
  async findAll() {
    
    return await this.postService.findAll();
  }
}
