import { ERROR_MESSAGES } from '../constants/error-messages';
import * as argon2 from 'argon2';
import passport from 'passport';
import { firstValueFrom } from 'rxjs';
import { AxiosResponse } from 'axios';
import { Repository } from 'typeorm';
import { emit } from 'process';
import { Account } from '../entities/account.entity';
import { AppDataSource } from '../data-source';

import * as jwt from 'jsonwebtoken';
import redisClient from './redis.client';


export class AuthService {
  private readonly jwtSecret: string;
  private readonly jwtExpiresIn: number;
  private readonly refreshExpiresIn: number;
  // private readonly coreServiceUrl: string;
  private _accountRepository: Repository<Account>;
  private readonly redis = redisClient

  private get accountRepository(): Repository<Account>{
    if(!this._accountRepository){
      console.log('AuthService: Initializing AccountRepository (Just-In-Time)...');
      this._accountRepository= AppDataSource.getRepository(Account)
    }
    return this._accountRepository
  }
  constructor() {

    // this._accountRepository = AppDataSource.getRepository(Account)
    this.jwtSecret = process.env.JWT_SECRET ;
    this.jwtExpiresIn = Number(process.env.JWT_EXPIRES_IN) || 900;
    this.refreshExpiresIn = Number(process.env.JWT_REFRESH_EXPIRES_IN) || 604800;
    // this.coreServiceUrl = process.env.CORE_SERVICE_URL || 'http://localhost:3001';
  }

  async registerUser(dto: { email: string; password: string }) {

    const existingAccount = await this.accountRepository.findOneBy({email: dto.email})
    if (existingAccount) {
      throw new Error('User with this email already exists');
    }

    const hashedPassword = await this.hashPassword(dto.password)


  //   const account = await this.accountReposi.save({
  //   email: signUpDto.email,
  //   password_hash: hashedPassword,
  //   provider: 'local',
  //   created_by: 'system', 
  // });

    const newAccount  = await this.accountRepository.save({
      email: dto.email,
      password_hash: hashedPassword,
      provider: 'local',
      // created_by: '00000000-0000-0000-0000-000000000000',
    })    
    return {accountId: newAccount.id , newAccount};
  }

  async authenticateUser(credentials: { email: string; password: string }) {
    const account = await this.accountRepository.findOneBy({email : credentials.email })
    if(!account){
      throw new Error('User not found')
    }
    const isPasswordValid = await this.comparePassword(
      credentials.password,
      account.password_hash
    )
    if(!isPasswordValid){
      throw new Error('Invalid password')
    }

    const tokens = this.generateNewTokens(account.id )

    const redisKey = `user_session:${account.id}`

    await this.redis.set(
      redisKey,
      tokens.refreshToken,
      'EX',
      this.refreshExpiresIn
    )

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      accountId: account.id
    }
  }

  async handleLogout(refreshToken: string){
    let accountId: string
    try{
      const decoded = jwt.decode(refreshToken) as {sub:string}
      if (!decoded || !decoded.sub) {
        throw new Error('Invalid token structure');
      }
       accountId = decoded.sub
    }catch(error){
      throw new Error('Invalid refresh token')
    }
   
    const redisKey = `user_session:${accountId}`

    const validTokenInRedis = await this.redis.get(redisKey)

    if (!validTokenInRedis) {
      return { message: 'Already logged out' };
    }

    if (refreshToken !== validTokenInRedis) {
      await this.redis.del(redisKey);
      throw new Error('Invalid refresh token (Session mismatch)');
    }

    const result = await this.redis.del(redisKey)

    if(result === 0 ){
      console.log(`Logout: Session not found in Redis for user ${accountId}`);
    }
    return {message: 'Logged out successfully'}
  }

  async processRefreshToken(oldRefreshToken: string) {
    let accountId: string;
    try{
      const decode  = jwt.decode(oldRefreshToken) as {sub: string}
      if(!decode || !decode.sub){
        throw new Error('Invalid token structure')
      }
      accountId = decode.sub
    }catch(error){
      throw new Error('Invalid refresh token')
    }

    const redisKey = `user_session:${accountId}`;
    const validateTokenInRedis = await this.redis.get(redisKey)

    if(!validateTokenInRedis){
      throw new Error('Session not found (likely logged out)')
    }

    if(oldRefreshToken !== validateTokenInRedis){

      await this.redis.del(redisKey)
      throw new Error('Refresh token re-use detected (Session terminated)');
    }

    const  newToken = this.generateNewTokens(accountId)

    await this.redis.set(
      redisKey,
      newToken.refreshToken,
      'EX',
      this.refreshExpiresIn
    )
    return newToken
  }

  async validateToken(accessToken: string) {
    try{
      const payload = jwt.verify(accessToken, this.jwtSecret) as { sub : string}

      return payload
    }catch(error){
      throw new Error('Invalid or expired token')
    }
  }

  async exchangeCodeForTokens(code: string, provider: string) {
    // TODO: Implement OAuth code exchange logic
    throw new Error(ERROR_MESSAGES.METHOD_NOT_IMPLEMENTED);
  }

  private generateNewTokens(accountId: string) {// userRole: string
    const payload = {
      sub: accountId,
    }
    const accessToken = jwt.sign(payload,this.jwtSecret,{expiresIn: this.jwtExpiresIn })


    const refreshToken = jwt.sign({sub: accountId}, this.jwtSecret, {expiresIn: this.refreshExpiresIn ,})

    return { accessToken , refreshToken}
  }

  private async hashPassword(password: string): Promise<string> {
     return await argon2.hash(password)

  }

  private async comparePassword(password: string, hash: string): Promise<boolean> {
    if(!hash || !password){
      return false
    }
    return await argon2.verify(hash, password)
  }
}


