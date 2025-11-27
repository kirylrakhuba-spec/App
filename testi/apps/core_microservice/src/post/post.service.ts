import { Post } from '@/database/entities/post.entity';
import { Profile } from '@/database/entities/profile.entity';
import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreatePostDto } from './dto/create-post.dto';

import * as fs from 'fs';  
import * as path from 'path';
@Injectable()
export class PostService {
    constructor(
        @InjectRepository(Profile)
        private readonly profileRepository: Repository<Profile>,
        @InjectRepository(Post)
        private readonly postRepository: Repository<Post>
    ){
        this.profileRepository=profileRepository
        this.postRepository=postRepository
    }

    async createPost(accountId: string,data: CreatePostParams){
        const authProfile =await this.profileRepository.findOne({where: {user:{accountId:accountId}}})
        if(!authProfile){
        throw new NotFoundException('Profile not found');
        }
        const newPost = this.postRepository.create({
        imageUrl: data.imageUrl,
        caption: data.caption,
        profile: authProfile
    })
    return await this.postRepository.save(newPost)
    }

    async remove(postId:string,currentAccountId:string){
        const post = await this.postRepository.findOne({where:{id:postId},
        relations:['profile', 'profile.user']})
        if(!post){
            throw new NotFoundException('Post not found');
        }
        if(post.profile.user.accountId !== currentAccountId){
            throw new ForbiddenException('You are not the author of this post');
        }
        if(post.imageUrl){
            this.deleteFileFromDisk(post.imageUrl);
        }
        return await this.postRepository.remove(post)
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
    


    async findCurrentPost(postId:string){
        const post = await this.postRepository.findOne({where:{id:postId},
        relations:['profile']})
        if(!post){
            throw new NotFoundException('Post not found');
        }
        return post
    }
    async findAll(){
        return this.postRepository.find()
    }
}


interface CreatePostParams {
    caption?: string;
    imageUrl: string;
}