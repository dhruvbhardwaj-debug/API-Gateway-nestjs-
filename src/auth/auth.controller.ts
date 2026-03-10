import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterUser } from './DTOs/registerUser.dto';
import { LoginUser } from './DTOs/loginDto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // POST http://localhost:3000/auth/register
  @Post('register')
  async register(@Body() registerDto: RegisterUser) {
    return this.authService.registerUser(registerDto);
  }

  // POST http://localhost:3000/auth/login
  @Post('login')
  async login(@Body() loginDto: LoginUser) {
    return this.authService.login(loginDto);
  }
}