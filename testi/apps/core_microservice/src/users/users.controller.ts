import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { ERROR_MESSAGES, HTTP_STATUS } from '../constants/error-messages';
import { CurrentUser, CurrentUser as CurrentUserType } from '../decorators/current-user.decorator';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { UsersService } from './users.service';
import { RolesGuard } from '@/guards/roles.guard';
import { Roles } from '@/decorators/roles.decorator';
import { AdminUpdateDto } from './dto/admin-update-user.dto';

@ApiTags('Users')
@UseGuards(RolesGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('current_user')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user from JWT token' })
  @ApiResponse({ status: HTTP_STATUS.OK, description: 'Current user retrieved successfully' })
  @ApiResponse({ status: HTTP_STATUS.UNAUTHORIZED, description: 'Invalid or missing token' })
  @ApiResponse({ status: HTTP_STATUS.NOT_FOUND, description: 'User not found' })
  async getCurrentUser(@CurrentUser() accountId: CurrentUserType) {
    try {
      return await this.usersService.getCurrentUser(accountId.id);
    } catch (error) {
      throw error;
    }
  }

  @Get() 
  findAll() {
    return this.usersService.findAll();
  }

  @Post('create')
  createUser(){
    return this.usersService.createUser()
  }

  @Patch(':id')
  @Roles('Admin')
  updateUser(@Param('id') id:string, @Body() body:AdminUpdateDto){
    return this.usersService.updateUser(id,body)
  }

  @Delete(':id')
  removeUser(@Param('id') id:string){
    return this.usersService.removeUser(id)
  }


}
