import { Injectable } from '@nestjs/common';
import { RegisterUser } from 'src/auth/DTOs/registerUser.dto';
import { InjectModel } from '@nestjs/mongoose'; 
import { User } from './schemas/user.schema'
import { Model } from 'mongoose';
import e from 'express';
import { UnauthorizedException } from '@nestjs/common';


@Injectable()
export class UserService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  async findByEmail(email: string) {
    const user = await this.userModel.findOne({ email });
    if (!user) throw new UnauthorizedException('User not found');
    return user;
  }
  async createUser(registerUserDTO: RegisterUser) {
    try{
      await this.userModel.create({
        fname:registerUserDTO.fname,
        lname:registerUserDTO.lname,
        email:registerUserDTO.email,
        password:registerUserDTO.password

    })
    return {message:"success"}
  }catch(err){
    console.log("there is an error")
    return {message:"error",err}}
  }
}