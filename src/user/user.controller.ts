import { Controller, Get, Post } from '@nestjs/common';
import { UserService } from './user.service';
import { Body, Param } from '@nestjs/common';
import { userDTO } from './DTO/userDTO';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('profile/:slug')
  async profile(@Param('slug') slug: string) {
    return await this.userService.getUserBySlug(slug);
  }
}
