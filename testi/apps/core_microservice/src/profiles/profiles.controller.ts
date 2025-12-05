import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { ApiBearerAuth, ApiConsumes, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { HTTP_STATUS } from '../constants/error-messages';
import { CurrentUser } from '../decorators/current-user.decorator';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { ProfilesService } from './profiles.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { query } from 'express';

@ApiTags('Profiles')
@Controller('profiles')
export class ProfilesController {
  constructor(private readonly profilesService: ProfilesService) {}

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user profile from JWT token' })
  @ApiResponse({ status: HTTP_STATUS.OK, description: 'Current user profile retrieved successfully' })
  @ApiResponse({ status: HTTP_STATUS.UNAUTHORIZED, description: 'Invalid or missing token' })
  @ApiResponse({ status: HTTP_STATUS.NOT_FOUND, description: 'Profile not found' })
  async getMyProfile(@CurrentUser() user: {id:string}) {
      return await this.profilesService.getMyProfile(user.id);
  }

  
  @Patch('me') 
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @UseInterceptors(FileInterceptor('avatar'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Update current user profile' })
  async updateProfile(
    @Body() dto: UpdateProfileDto,
    @CurrentUser() user: { id: string },
    @UploadedFile() file?: Express.Multer.File 
  ) {
    let avatarUrl: string | undefined;

    if (file) {
      avatarUrl = `/uploads/${file.filename}`;
    }

    return this.profilesService.updateProfile(user.id, dto, avatarUrl);
  }

  @Get('search')
  async findProfile(@Query('q') query: string){
  if (!query) return [];

    return await this.profilesService.search(query)
  }


  @Get(':username') 
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async getProfileForUser(@Param('username') username:string){
    return await this.profilesService.getProfileByUsername(username)
  }


  @Post(':username/follow')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Follow user' })
  async userFollow(@Param('username') username:string,@CurrentUser() user: {id:string}){
    return this.profilesService.follow(user.id,username)
  }

  @Delete(':username/follow')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Unfollow user' })
  async userUnfollow(@Param('username') username:string,@CurrentUser() user: {id:string}){
    return this.profilesService.unfollow(user.id,username)
  }
}
