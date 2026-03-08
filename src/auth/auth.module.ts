import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UserModule } from 'src/user/user.module';
import { JwtModule } from '@nestjs/jwt';
import { AuthGuard } from './auth.guard';

@Module({
  imports: [
    JwtModule.register({
      global: true, // This makes JwtService available everywhere without re-importing
      secret: 'My secret key', // Use an env variable in production!
      signOptions: { expiresIn: '1h' },
    }),
    UserModule],
  controllers: [AuthController],
  providers: [AuthService,AuthGuard],
  exports:[AuthService, JwtModule]
})
export class AuthModule {}
