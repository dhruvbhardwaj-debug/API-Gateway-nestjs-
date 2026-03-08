import { Controller, All, Req, Res, UseGuards } from '@nestjs/common';
import type { Request, Response } from 'express';
import { createProxyMiddleware, Options } from 'http-proxy-middleware';
import { AuthGuard } from '../auth/auth.guard';
import { ThrottlerGuard } from '@nestjs/throttler';

@UseGuards(ThrottlerGuard, AuthGuard)
@Controller('proxy')
export class ApiGatewayController {
  private proxyMap: Record<string, string> = {
    'orders': 'http://192.168.1.10:3001',
    'catalog': 'http://192.168.1.11:3002',
    'test': 'https://jsonplaceholder.typicode.com',
  };

  // Using *path to capture everything after the service name
  @All(':service/*path') 
  async handleProxy(@Req() req: Request, @Res() res: Response) {
    const serviceName = req.params.service as string;
    const target = this.proxyMap[serviceName];

    if (!target) {
      return res.status(404).json({ message: 'Service not found in gateway map' });
    }

    const proxyOptions: Options = {
      target,
      changeOrigin: true, // Crucial for external HTTPS targets
      secure: false,      // Set to true in production with valid SSL
      pathRewrite: (path) => {
        // This removes '/proxy/serviceName' from the start of the URL string
        return path.replace(new RegExp(`^/proxy/${serviceName}`), '');
      },
      on: {
        proxyReq: (proxyReq, req: any) => {
          // Add debugging log to see the URL transformation in your console
          console.log(`[Proxying] ${req.method} ${req.url} -> ${target}${proxyReq.path}`);
          
          if (req.user) {
            proxyReq.setHeader('x-user-id', String(req.user.sub));
            proxyReq.setHeader('x-user-role', String(req.user.role));
          }
        },
        error: (err, req, res: any) => {
          console.error('[Proxy Error]', err.message);
          res.status(502).json({ message: 'Target service unreachable', error: err.message });
        },
      },
    };

    const proxy = createProxyMiddleware(proxyOptions);

    // Casting res to any to avoid NestJS/Express type conflicts
    proxy(req, res as any, (next) => {});
  }
}