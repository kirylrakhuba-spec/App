import { Body, Controller, Get, Patch, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { ApiBearerAuth, ApiConsumes, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { HTTP_STATUS } from '../constants/error-messages';
import { CurrentUser } from '../decorators/current-user.decorator';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { ProfilesService } from './profiles.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { UpdateProfileDto } from './dto/update-profile.dto';

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
}
