import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { ERROR_MESSAGES } from '../constants/error-messages';
import { User } from '../database/entities/user.entity';
import { CurrentUser } from '@/decorators/current-user.decorator';
import { throws } from 'assert';
import { SchemaTextFieldPhonetics } from 'redis';
import { error } from 'console';


@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {
    this.userRepository=userRepository
  }

  async getCurrentUser(userId: string) {
      const currentUser =await this.userRepository.findOneBy({id: userId})
      if(!currentUser){
        throw new Error(ERROR_MESSAGES.USER_NOT_FOUND);
      }
      return currentUser
  }
  async findAll(){
    return this.userRepository.find()
  }

  async createUser(){
    try{
    const newUser = this.userRepository.create({
    disabled: false,
    created_by:  "User"
   })

   const saveUser = await this.userRepository.save(newUser)
   return saveUser;
  }
  catch(error){
    throw new BadRequestException('Ошибка при создании пользователя')
  }

  }

  async updateUser(userId:string,updatedDto:any){
    const user = await this.userRepository.findOneBy({id:userId});
    if(!user){
      throw new NotFoundException('Пользователь не найден')
    }
    Object.assign(user, updatedDto)
    return this.userRepository.save(user)
  }

  async removeUser(userId:string){
    return this.userRepository.delete(userId)
  }
 

}
