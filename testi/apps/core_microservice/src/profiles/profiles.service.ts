import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';

import { ERROR_MESSAGES } from '../constants/error-messages';
import { Profile } from '../database/entities/profile.entity';
import { UpdateProfileDto } from './dto/update-profile.dto';
import path from 'path';

import * as fs from 'fs';  
import { strict } from 'assert';
import { ProfileFollow } from '@/database/entities/profile-follow.entity';
@Injectable()
export class ProfilesService {
  constructor(
    @InjectRepository(Profile)
    private readonly profileRepository: Repository<Profile>,
    @InjectRepository(ProfileFollow)
    private readonly profileFollow: Repository<ProfileFollow>
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

  async search(query:string){
    const profiles = await this.profileRepository.find({where:[
      {username:ILike(`${query}%`)},
      {display_name:ILike(`${query}%`)}],
      take:10,
      select: {
        id: true,
        username: true,
        display_name: true,
        avatar_url:true
      }
  })
  return profiles
  }

  async getProfileByUsername(username: string,viewerAccountId?: string){
    const targetProfile = await this.profileRepository.findOne(
      {where:{username:username},
      relations:['posts'],
      order: {
        posts: {
          created_at: 'DESC'}
  }})
  if (!targetProfile) {
      throw new NotFoundException('User not found'); 
    }

    let isFollowing = false
    if(viewerAccountId){
      const myProfile = await this.profileRepository.findOne({where:
        {user:{accountId: viewerAccountId}}})
        if(myProfile){
          const followEntry = await this.profileFollow.findOne({
            where:{
              followerProfile:{id: myProfile.id},
              followedProfile:{id: targetProfile.id}
            }
          })
          if (followEntry) {
            isFollowing = true;
        } else {
            isFollowing = false;
        }
        }
    }
    
    return {...targetProfile,isFollowing}
  }

  async follow(myAccountId:string,targetUsername:string){
    const myProfile = await this.profileRepository.findOne({where:{
      user:{accountId:myAccountId}
    }})
    if(!myProfile){
      throw new NotFoundException('User not found')
    }
    const targetUser = await this.profileRepository.findOne({
      where:{username:targetUsername}
    })
    if(!targetUser){
      throw new NotFoundException('User not found')
    }
       if(myProfile.id === targetUser.id){
      throw new BadRequestException('You cannot follow yourself')
    }
    const existingFollow = await this.profileFollow.findOne({
      where:{
        followerProfile:{id :myProfile.id},
        followedProfile:{id:targetUser.id}
    }})
    if(existingFollow){
      return existingFollow
    }
 
    const follower = this.profileFollow.create({
    follower_profile_id: myProfile.id,
    followed_profile_id: targetUser.id,

    created_by: myAccountId
    })
    return this.profileFollow.save(follower)
  }

  async unfollow(myAccountId:string,targetUsername:string){
    const myProfile = await this.profileRepository.findOne({where:{
      user:{accountId:myAccountId}
    }})
    if(!myProfile){
      throw new NotFoundException('User not found')
    }
    const targetUser = await this.profileRepository.findOne({
      where:{username:targetUsername}
    })
    if(!targetUser){
      throw new NotFoundException('User not found')
    }
       if(myProfile.id === targetUser.id){
      throw new BadRequestException('You cannot follow yourself')
    }
    const existingFollow = await this.profileFollow.findOne({
      where:{
        followerProfile:{id :myProfile.id},
        followedProfile:{id:targetUser.id}
    }})
    if(!existingFollow){
      throw new BadRequestException('You dont follow')
    }
    return this.profileFollow.remove(existingFollow)
  }

  async findAll(){
    return await this.profileRepository.find({relations: ['user']})
  }
  
}
