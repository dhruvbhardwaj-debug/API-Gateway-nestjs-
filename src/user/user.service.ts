import { Injectable } from '@nestjs/common';
import { RegisterUser } from 'src/auth/DTOs/registerUser.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './schemas/user.schema';
import { Model } from 'mongoose';
import e from 'express';
import { UnauthorizedException } from '@nestjs/common';
import { userDTO } from './DTO/userDTO';
import { NotFoundException } from '@nestjs/common';
@Injectable()
export class UserService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  async findByEmail(email: string) {
    const user = await this.userModel.findOne({ email });
    if (!user) throw new UnauthorizedException('User not found');
    return user;
  }

async getUserBySlug(userSlug: string) {
  try {
    // Search the 'slug' column for the string passed from the URL
    const user = await this.userModel.findOne({ slug: userSlug }).select('-password').exec();
    
    if (!user) {
      throw new NotFoundException(`User with slug ${userSlug} not found`);
    }

    return user;
  } catch (err) {
    return { message: "error", error: err.message };
  }
}

  async createUser(registerUserDTO: RegisterUser) {
    try {
      // 1. Generate a basic slug (e.g., "John Doe" -> "john-doe")
      // We also add a small random string to ensure it's unique if two people have the same name
      const baseSlug = `${registerUserDTO.fname}-${registerUserDTO.lname}`
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '-'); // Remove non-alphanumeric characters

      const uniqueSlug = `${baseSlug}-${Math.floor(1000 + Math.random() * 9000)}`;

      // 2. Create the user with the new slug field
      await this.userModel.create({
        fname: registerUserDTO.fname,
        lname: registerUserDTO.lname,
        email: registerUserDTO.email,
        password: registerUserDTO.password,
        slug: uniqueSlug, // Save it to the DB
      });

      return { message: 'success', slug: uniqueSlug };
    } catch (err) {
      console.error('Registration error:', err);
      return { message: 'error', error: err.message };
    }
  }
}
