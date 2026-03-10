import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { RegisterUser } from '../auth/DTOs/registerUser.dto';

@Injectable()
export class UserService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async createUser(registerUserDTO: RegisterUser) {
    // Force email to lowercase to prevent case-sensitivity login bugs
    const email = registerUserDTO.email.toLowerCase();

    const existingUser = await this.userModel.findOne({ email });
    if (existingUser) {
      throw new ConflictException("User with this email already exists");
    }

    const baseSlug = `${registerUserDTO.fname}-${registerUserDTO.lname}`
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-');
    const uniqueSlug = `${baseSlug}-${Math.floor(1000 + Math.random() * 9000)}`;

    const newUser = await this.userModel.create({
      ...registerUserDTO,
      email: email, // Save the lowercase email
      slug: uniqueSlug
    });
    
    return newUser;
  }

  async findByEmail(email: string) {
    // Search using lowercase to match the created user
    const user = await this.userModel.findOne({ email: email.toLowerCase() }).exec();
    
    if (!user) {
      throw new NotFoundException('User not found');
    }
    
    return user;
  }

  async getUserBySlug(slug: string) {
    const user = await this.userModel.findOne({ slug }).select('-password').exec();
    
    if (!user) {
      throw new NotFoundException(`User profile "${slug}" not found`);
    }
    
    return user;
  }
}