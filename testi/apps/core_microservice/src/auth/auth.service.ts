import { HttpService } from '@nestjs/axios';
import { ConflictException, Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { firstValueFrom, single } from 'rxjs';

import { ERROR_MESSAGES } from '../constants/error-messages';
import { LoginDto } from './dto/login.dto';
import { RefreshDto } from './dto/refresh-token.dto';
import { SignUpDto } from './dto/signup.dto';
import { DataSource, Repository } from 'typeorm';
import { AxiosResponse } from 'axios';
import { User } from '@/database/entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Profile } from '@/database/entities/profile.entity';
import { count, timeStamp } from 'console';
import { threadId } from 'worker_threads';

@Injectable()
export class AuthService {
  constructor(private readonly httpService: HttpService,
  @InjectRepository(User)
  private readonly userRepository: Repository<User>,
  @InjectRepository(Profile)
  private readonly profileRepository: Repository<Profile>,
  private readonly dataSource: DataSource,
    )  {
      // this.accountRepository=accountRepository
    }

  async handleSignUp(signUpDto: SignUpDto) {
    const url = `${process.env.AUTH_SERVICE_URL}/internal/auth/register`;
    let authResponse: {accountId: string; email: string}

    try{
      const {data} = await firstValueFrom(
    this.httpService.post(url, {
      email: signUpDto.email,
      password : signUpDto.password,
    }),
    )
    authResponse = data

    }catch(error){
      if (error.response?.status === 409) {
        throw new ConflictException('User with this email already exists');
      }
      // просто упал
      console.error(error);
      throw new InternalServerErrorException('Authentication service failed');
    }

    const queryRunner = this.dataSource.createQueryRunner()
    await queryRunner.connect()
    await queryRunner.startTransaction()

    try{
      const user = queryRunner.manager.create(User,{
        accountId: authResponse.accountId,
        role: 'User',
        // created_by: 'system'
      })

      const newUser = await queryRunner.manager.save(user)

      const profile = queryRunner.manager.create(Profile,{
        user_id: newUser.id,
        username: signUpDto.username,
        display_name: signUpDto.displayName,
        birthday: signUpDto.birthday,
        bio: signUpDto.bio || ' ',
        // created_by: 'system'
      })

      const newProfile = await queryRunner.manager.save(profile)

      await queryRunner.commitTransaction();

      return newProfile;
    }catch(error){
      await queryRunner.rollbackTransaction();
      console.log('Failed to create user/profile, rolling back...', error);
      throw new InternalServerErrorException('Failed to create user profile');
    }finally{
      await queryRunner.release()
    }
  }

  async handleLogin(credentials: LoginDto) {
    const url = `${process.env.AUTH_SERVICE_URL}/internal/auth/login`;

    let authResponse : {
      accessToken: string;
      refreshToken: string;
      accountId: string;
    };

    try{
    const {data} = await firstValueFrom( this.httpService.post( url , {
      email: credentials.email,
      password: credentials.password
    }))
    authResponse = data
  }catch(error){
    if(error.response?.status === 401){
      throw new UnauthorizedException('Invalid email or password')
    }
    console.error(error)
    throw new InternalServerErrorException('Authentication service failed')
  }

  try{
    const user = await this.userRepository.findOneBy({accountId: authResponse.accountId})

    if(!user){
      throw new InternalServerErrorException('User profile not found after login')

    }

    const profile = await this.profileRepository.findOneBy({user_id:user.id})

    return {
      accessToken: authResponse.accessToken,
      refreshToken: authResponse.refreshToken,
      profile: profile
    }
  }catch(error){
    throw new InternalServerErrorException('Failed to retrieve user profile')
  }
  }

  async handleOAuthInit(provider: string) {
    // TODO: Make HTTP request to Authentication Microservice for OAuth URL
    throw new Error(ERROR_MESSAGES.METHOD_NOT_IMPLEMENTED);
  }

  async handleOAuthCallback(provider: string, authorizationCode: string) {
    // TODO: Forward authorization code to Authentication Microservice
    throw new Error(ERROR_MESSAGES.METHOD_NOT_IMPLEMENTED);
  }

  async handleRefresh(refreshToken: string) {
    const url = `${process.env.AUTH_SERVICE_URL}/internal/auth/refresh`;

     try{
      const {data} = await firstValueFrom(this.httpService.post(url, {refreshToken}))

      return data
     }catch(error){
      if (error.response?.status === 401) {
         throw new UnauthorizedException('Invalid or expired refresh token');
      }
      console.log(error);
      throw new InternalServerErrorException('Token refresh failed')
    }
  }

  async handleLogout(refreshToken: string) {
     const url = `${process.env.AUTH_SERVICE_URL}/internal/auth/logout`;

     try{
      const {data} = await firstValueFrom(this.httpService.post(url, {refreshToken}))

      return data
     }catch(error){
      if (error.response?.status === 401) {
         throw new UnauthorizedException('Invalid refresh token');
      }
      
      console.error(error);
      throw new InternalServerErrorException('Logout failed');
     }
  }

  async validateToken(accessToken: string) {
    const url = `${process.env.AUTH_SERVICE_URL}/internal/auth/validate`;

     try{
      const {data} = await firstValueFrom(this.httpService.post(url, {accessToken}))

      return data
     }catch(error){
   
      throw new InternalServerErrorException('Token validation failed');
     }  
  }


  // async findById(accountId:string){
  //   const currentAccount =await this.accountRepository.findOneBy({id: accountId})
  //   if(!currentAccount){
  //     throw new Error(ERROR_MESSAGES.ACCOUNT_NOT_FOUND);
  //   }
  //   return currentAccount
  // }

  // async findByEmail(accountEmail:string){
  //   const currentAccount =await this.accountRepository.findOneBy({email: accountEmail})
  //   if(!currentAccount){
  //     throw new Error(ERROR_MESSAGES.ACCOUNT_NOT_FOUND);
  //   }
  //   return currentAccount
  // }
}
