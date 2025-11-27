import { Body, Controller, Get, Param, Post, Req, Res, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Request, Response } from 'express';

import { ERROR_MESSAGES } from '../constants/error-messages';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RefreshDto } from './dto/refresh-token.dto';
import { SignUpDto } from './dto/signup.dto';
import { LogoutDto } from './dto/logout.dto';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  @ApiOperation({ summary: 'User registration' })
  @ApiResponse({ status: 201, description: 'User registered successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 409, description: 'User already exists' })
  async signUp(@Body() signUpDto: SignUpDto, @Res() res: Response) {
    try {
      const newUser = await this.authService.handleSignUp(signUpDto)
      return res.status(201).json({
        message: 'User registered successfully',
        user: newUser
      })
    } catch (error) {
      return res.status(500).json({
        message: 'User registration failed',
        error: error.message,
      });
    }
  }

  @Post('login')
  @ApiOperation({ summary: 'User login with email and password' })
  @ApiResponse({ status: 200, description: 'Login successful' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async login(@Body() loginDto: LoginDto) {
      const loginData = await this.authService.handleLogin(loginDto)
      
      return loginData
    }
  
    
  @Post('refresh')
  @ApiOperation({ summary: 'Refresh access token' })
  @ApiResponse({ status: 200, description: 'Token refreshed successfully' })
  @ApiResponse({ status: 401, description: 'Invalid refresh token' })
  async refresh(@Body() refreshTokenDto: RefreshDto) {  
    const newToken = this.authService.handleRefresh(refreshTokenDto.refreshToken)
    return newToken
  }

  @Get('login/:provider')
  @ApiOperation({ summary: 'Initiate OAuth login' })
  @ApiResponse({ status: 302, description: 'Redirect to OAuth provider' })
  async handleOAuthLogin(@Param('provider') provider: string, @Res() res: Response) {
    try {
      // TODO: Implement OAuth login initiation
      throw new Error(ERROR_MESSAGES.METHOD_NOT_IMPLEMENTED);
    } catch (error) {
      throw error;
    }
  }

  @Get(':provider/callback')
  @ApiOperation({ summary: 'Handle OAuth callback' })
  @ApiResponse({ status: 200, description: 'OAuth callback handled successfully' })
  async handleOAuthCallback(
    @Param('provider') provider: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    try {
      // TODO: Implement OAuth callback handling
      throw new Error(ERROR_MESSAGES.METHOD_NOT_IMPLEMENTED);
    } catch (error) {
      throw error;
    }
  }

  @Post('logout')
  // @UseGuards(JwtAuthGuard)
  // @ApiBearerAuth()
  @ApiOperation({ summary: 'User logout' })
  @ApiResponse({ status: 200, description: 'Logout successful' })
  async logout(@Body() logoutDto: LogoutDto ) {
    const result = await this.authService.handleLogout(logoutDto.refreshToken)

    return result
  }
}
