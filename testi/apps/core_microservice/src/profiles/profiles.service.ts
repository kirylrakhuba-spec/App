import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { ERROR_MESSAGES } from '../constants/error-messages';
import { Profile } from '../database/entities/profile.entity';
import { UpdateProfileDto } from './dto/update-profile.dto';
import path from 'path';

import * as fs from 'fs';  
import { strict } from 'assert';
@Injectable()
export class ProfilesService {
  constructor(
    @InjectRepository(Profile)
    private readonly profileRepository: Repository<Profile>,
  ) {}

  async getMyProfile(accountId: string) {
      const profile = await this.profileRepository.findOne({where:{
        user:{accountId:accountId}
      }})
      if(!profile){
        throw new NotFoundException('Profile not found');
      }
    return profile
}
  async updateProfile(accountId:string,dto:UpdateProfileDto,avatarUrl?:string){
    const profile = await this.profileRepository.findOne({where:{
      user:{accountId:accountId}
    }})
    if(!profile){
        throw new NotFoundException('Profile not found');
      }
    if(avatarUrl && profile.avatar_url){
      this.deleteFileFromDisk(profile.avatar_url)
    }
    if(dto.displayName){
      profile.display_name=dto.displayName
    }
    if(dto.bio){
      profile.bio=dto.bio
    }
    if(avatarUrl){
      profile.avatar_url=avatarUrl
    }

    return await this.profileRepository.save(profile)
  }


     private deleteFileFromDisk(imageUrl:string){
          try{
              const fileName = path.basename(imageUrl)
              const filePath = path.join(process.cwd(),'uploads', fileName)
  
              if(fs.existsSync(filePath)){
                  fs.unlinkSync(filePath)
                  console.log(`Deleted file: ${filePath}`);
              }
          }catch(error){
              console.error(`Failed to delete file: ${imageUrl}`, error);
          }
          
      }
}
