import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterUser } from './DTOs/registerUser.dto';
import { UseGuards } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
import { LoginUser } from './DTOs/loginDto'


@UseGuards(ThrottlerGuard)
@Controller('auth') // auth/register
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  
  @Post('login')
  async login(@Body() loginDto: LoginUser) {
    return await this.authService.login(loginDto);
  }
  
  
  @Post('register')
  async register(@Body() registerUserDTO: RegisterUser) {
    return await this.authService.registerUser(registerUserDTO);
  }
}
