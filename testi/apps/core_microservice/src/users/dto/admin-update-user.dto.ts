import { IsOptional, IsBoolean, IsString } from 'class-validator';

export class AdminUpdateDto {
    @IsOptional()
    @IsString()
    role?: string

    @IsOptional()
    @IsBoolean()
     disabled?: string

     @IsOptional()
     @IsString()
     created_by?:string
}