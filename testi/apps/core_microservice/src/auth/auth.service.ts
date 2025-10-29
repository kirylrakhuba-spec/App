import { HttpService } from '@nestjs/axios';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { firstValueFrom, single } from 'rxjs';

import { ERROR_MESSAGES } from '../constants/error-messages';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { SignUpDto } from './dto/signup.dto';
import { Account } from '@/database/entities/account.entity';
import { Repository } from 'typeorm';
import { AxiosResponse } from 'axios';

@Injectable()
export class AuthService {
  constructor(private readonly httpService: HttpService,
  // private readonly accountRepository: Repository<Account>
    )  {
      // this.accountRepository=accountRepository
    }

  async handleSignUp(signUpDto: SignUpDto) {
    const url = `${process.env.AUTH_SERVICE_URL}/internal/auth/register`;
  console.log('Sending signup to Auth Microservice:', url);

  const response: AxiosResponse = await firstValueFrom(
    this.httpService.post(url, signUpDto)
  );

  return response.data;
  }

  async handleLogin(credentials: LoginDto) {
    // TODO: Forward credentials to Authentication Microservice
    throw new Error(ERROR_MESSAGES.METHOD_NOT_IMPLEMENTED);
  }

  async handleOAuthInit(provider: string) {
    // TODO: Make HTTP request to Authentication Microservice for OAuth URL
    throw new Error(ERROR_MESSAGES.METHOD_NOT_IMPLEMENTED);
  }

  async handleOAuthCallback(provider: string, authorizationCode: string) {
    // TODO: Forward authorization code to Authentication Microservice
    throw new Error(ERROR_MESSAGES.METHOD_NOT_IMPLEMENTED);
  }

  async handleRefresh(refreshTokenId: string) {
    // TODO: Forward refresh token to Authentication Microservice
    throw new Error(ERROR_MESSAGES.METHOD_NOT_IMPLEMENTED);
  }

  async handleLogout(refreshTokenId: string) {
    // TODO: Forward logout request to Authentication Microservice
    throw new Error(ERROR_MESSAGES.METHOD_NOT_IMPLEMENTED);
  }

  async validateToken(accessToken: string) {
    // TODO: Validate token with Authentication Microservice
    throw new Error(ERROR_MESSAGES.METHOD_NOT_IMPLEMENTED);
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
