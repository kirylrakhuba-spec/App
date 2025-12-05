import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class CreatePostDto {
 
  @ApiProperty({
    description: 'Файл картинки',
    type: 'string',
    format: 'binary', 
  })
  @IsOptional()
  image: any; 

 
  @ApiPropertyOptional({
    description: 'Описание поста',
    example: 'Мой крутой кот',
  })
  @IsString()
  @IsOptional()
  caption?: string;

 
}