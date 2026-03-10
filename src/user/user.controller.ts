import { Controller, Get, Param } from '@nestjs/common';
import { UserService } from './user.service';

@Controller('profile')
export class UserController {
  constructor(private readonly userService: UserService) {}

  // GET http://localhost:3000/profile/john-doe-1234
  @Get(':slug')
  async getProfile(@Param('slug') slug: string) {
    return this.userService.getUserBySlug(slug);
  }
}