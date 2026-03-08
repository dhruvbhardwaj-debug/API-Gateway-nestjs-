import { Module } from '@nestjs/common';
import { ApiGatewayController } from './api-gateway.controller';
import { AuthModule } from '../auth/auth.module'; // Import Auth

@Module({
  imports: [AuthModule], // This allows Gateway to use AuthGuard
  controllers: [ApiGatewayController],
})
export class ApiGatewayModule {}
