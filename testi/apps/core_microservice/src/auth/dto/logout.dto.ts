import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class LogoutDto {
  @ApiProperty({
    description: 'The Refresh Token to be invalidated',
    example: 'eyJhbGciOi...',
  })
  @IsString()
  @IsNotEmpty()
  refreshToken: string;
}