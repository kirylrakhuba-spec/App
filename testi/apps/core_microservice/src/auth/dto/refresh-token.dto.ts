import { ApiProperty } from '@nestjs/swagger';
import { IsJWT, IsNotEmpty, IsString } from 'class-validator';

export class RefreshDto { 
  @ApiProperty({
    description: 'The Refresh Token (JWT) to be exchanged',
    example: 'eyJhbGciOi...',
  })
  @IsString()
  @IsNotEmpty()
  // @IsJWT() 
  refreshToken: string; 
}