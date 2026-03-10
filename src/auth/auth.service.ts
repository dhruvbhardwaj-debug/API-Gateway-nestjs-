import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UserService } from '../user/user.service';
import { RegisterUser } from './DTOs/registerUser.dto';
import { LoginUser } from './DTOs/loginDto';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService
  ) {}

  async registerUser(registerUserDTO: RegisterUser) {
    // 1. Hash the password
    const hashedPassword = await bcrypt.hash(registerUserDTO.password, 10);
    
    // 2. Create the user with the hashed password
    const user = await this.userService.createUser({
      ...registerUserDTO, 
      password: hashedPassword
    });

    // 3. Generate token
    const payload = { sub: user._id, email: user.email, role: user.role };
    
    return {
      message: "User registered successfully",
      profile_url: `/profile/${user.slug}`,
      access_token: await this.jwtService.signAsync(payload)
    };
  }

  async login(loginDto: LoginUser) {
    // 1. Find the user by email
    const user = await this.userService.findByEmail(loginDto.email);

    // 2. Compare the plain password with the hashed password in the DB
    const isMatch = await bcrypt.compare(loginDto.password, user.password);

    if (!isMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // 3. Generate token if password matches
    const payload = { sub: user._id, email: user.email, role: user.role };
    
    return {
      message: "Login successful",
      access_token: await this.jwtService.signAsync(payload),
    };
  }
}