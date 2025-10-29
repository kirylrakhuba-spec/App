import { ERROR_MESSAGES } from '../constants/error-messages';
import * as argon2 from 'argon2';
import passport from 'passport';
import { firstValueFrom } from 'rxjs';
import { HttpService } from './http.service';
import { AxiosResponse } from 'axios';
import { Repository } from 'typeorm';


export class AuthService {
  private readonly jwtSecret: string;
  private readonly jwtExpiresIn: string;
  private readonly refreshExpiresIn: string;
  private readonly coreServiceUrl: string;

  constructor(
    private readonly httpService: HttpService,
    // private readonly accountRepository: Repository<Account>
  ) {
    this.jwtSecret = process.env.JWT_SECRET || 'your-super-secret-jwt-key-here';
    this.jwtExpiresIn = process.env.JWT_EXPIRES_IN || '15m';
    this.refreshExpiresIn = process.env.JWT_REFRESH_EXPIRES_IN || '7d';
    this.coreServiceUrl = process.env.CORE_SERVICE_URL || 'http://localhost:3001';
  }

  async registerUser(signUpDto: {
    email: string;
    password: string;
    username: string;
    displayName: string;
    birthday: string;
    bio?: string;
  }) {
    const hashedPassword = await this.hashPassword(signUpDto.password)


  //   const account = await this.accountReposi.save({
  //   email: signUpDto.email,
  //   password_hash: hashedPassword,
  //   provider: 'local',
  //   created_by: 'system', 
  // });

    const payload = {
      email: signUpDto.email,
      password: hashedPassword,
      username: signUpDto.username,
      displayName: signUpDto.displayName,
      birthday: signUpDto.birthday,
      bio:  signUpDto.bio || ''
    }

    console.log('POST URL:', `${this.coreServiceUrl}/auth/signup`);
    console.log('PAYLOAD:', payload);

    const response: CreateUserResponse = await this.httpService.post<CreateUserResponse>(`${this.coreServiceUrl}/auth/signup`, payload);
    return response;
  }

  async authenticateUser(credentials: { email: string; password: string }) {
    // TODO: Implement user authentication logic
    throw new Error(ERROR_MESSAGES.METHOD_NOT_IMPLEMENTED);
  }

  async processRefreshToken(oldRefreshTokenId: string) {
    // TODO: Implement refresh token processing logic
    throw new Error(ERROR_MESSAGES.METHOD_NOT_IMPLEMENTED);
  }

  async validateToken(accessToken: string) {
    // TODO: Implement token validation logic
    throw new Error(ERROR_MESSAGES.METHOD_NOT_IMPLEMENTED);
  }

  async exchangeCodeForTokens(code: string, provider: string) {
    // TODO: Implement OAuth code exchange logic
    throw new Error(ERROR_MESSAGES.METHOD_NOT_IMPLEMENTED);
  }

  private generateNewTokens(userId: string, userRole: string) {
    // TODO: Implement token generation logic
    throw new Error(ERROR_MESSAGES.METHOD_NOT_IMPLEMENTED);
  }

  private async hashPassword(password: string): Promise<string> {
     return await argon2.hash(password)

  }

  private async comparePassword(password: string, hash: string): Promise<boolean> {
    return await argon2.verify(hash, password)
  }
}


interface CreateUserResponse {
  email: string;
    password: string;
    username: string;
    displayName: string;
    birthday: string;
    bio?: string;
}