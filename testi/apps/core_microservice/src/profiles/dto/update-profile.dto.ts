import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, Length } from 'class-validator';

export class UpdateProfileDto {
  @ApiPropertyOptional({ description: 'Отображаемое имя', example: 'Super User' })
  @IsOptional()
  @IsString()
  @Length(2, 50)
  displayName?: string;

  @ApiPropertyOptional({ description: 'О себе', example: 'Люблю котиков' })
  @IsOptional()
  @IsString()
  @Length(0, 500)
  bio?: string;

  @ApiPropertyOptional({ 
    type: 'string', 
    format: 'binary', 
    description: 'Новая аватарка' 
  })
  @IsOptional()
  avatar?: any;
}