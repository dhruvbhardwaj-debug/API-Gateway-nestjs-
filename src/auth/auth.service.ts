import { Injectable } from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import { RegisterUser } from './DTOs/registerUser.dto';
import bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import { LoginUser } from './DTOs/loginDto';

@Injectable()
export class AuthService {
  constructor(private readonly userService: UserService,private readonly jwtService: JwtService) {}

  async login(loginDto: LoginUser) {
    const user = await this.userService.findByEmail(loginDto.email);
    const isMatch = await bcrypt.compare(loginDto.password, user.password);

    if (!isMatch) throw new UnauthorizedException('Invalid credentials');

    const payload = { sub: user._id, email: user.email, role: user.role };
    return {
      access_token: await this.jwtService.signAsync(payload),
    };
  }


  async registerUser(registerUserDTO: RegisterUser) {
    
    const hash = await bcrypt.hash(
      registerUserDTO.password,10);

    const user = await this.userService.createUser({...registerUserDTO, password:hash});
    //hash passwords-done
    //generate tokens 
    console.log(user);
    return { message: "user already registered" };
  } 
}
