import { Controller, All, Req, Res, UseGuards, Logger } from '@nestjs/common';
import type { Request, Response } from 'express';
import { createProxyMiddleware, Options, fixRequestBody } from 'http-proxy-middleware';
import { AuthGuard } from '../auth/auth.guard';
import { ThrottlerGuard } from '@nestjs/throttler';

@UseGuards(ThrottlerGuard, AuthGuard)
@Controller('proxy')
export class ApiGatewayController {
  private readonly logger = new Logger('ApiGateway');
  private proxyMap: Record<string, string> = {
    'game': 'http://localhost:3001',
    'catalog': 'http://192.168.1.11:3002',
    'test': 'https://jsonplaceholder.typicode.com',
  };

  @All(':service')
  async handleProxyBase(@Req() req: Request, @Res() res: Response) {
    return this.proxy(req, res, req.params.service as string);
  }

  @All(':service/*path')
  async handleProxy(@Req() req: Request, @Res() res: Response) {
    return this.proxy(req, res, req.params.service as string);
  }

  private async proxy(req: Request, res: Response, serviceName: string) {
    const target = this.proxyMap[serviceName];

    if (!target) {
      return res.status(404).json({
        message: `Service '${serviceName}' not found in gateway map`,
      });
    }

    const proxyOptions: Options = {
      target,
      changeOrigin: true,
      secure: false,
      pathRewrite: (path) => {
        const prefix = `/proxy/${serviceName}`;
        const newPath = path.replace(new RegExp(`^${prefix}`), '');
        return newPath === '' ? '/' : newPath;
      },
      on: {
        proxyReq: (proxyReq, req: any) => {
          fixRequestBody(proxyReq, req);
          this.logger.log(`[Proxy] ${req.method} ${req.url} -> ${target}${proxyReq.path}`);

          // Guard against headers already being sent
          if (!proxyReq.headersSent && req.user) {
            proxyReq.setHeader('x-user-id', String(req.user.sub || ''));
            proxyReq.setHeader('x-user-role', String(req.user.role || ''));
          }
        },
        error: (err, req, res: any) => {
          this.logger.error(`Proxy Error: ${err.message}`);
          res.status(502).json({
            message: 'Target service unreachable',
            error: err.message,
          });
        },
      },
    };

    const proxy = createProxyMiddleware(proxyOptions);
    return proxy(req, res as any, () => {});
  }
}