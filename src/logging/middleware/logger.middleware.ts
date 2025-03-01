import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
    private readonly logger = new Logger('HTTPServer');

    use(request: Request, response: Response, next: NextFunction) {
        response.on('finish', () => {
            this.logger.verbose(`Client: ${request.get('user-agent') || '(unknown)'}`);
            this.logger.verbose(`Host: ${request.get('host') || '(unknown)'}`);
            this.logger.verbose(`Length: ${request.get('content-length') || '(unknown)'}`);
            this.logger.log(
                `[${request.ip}] ${request.method} ${request.path} -> ${response.statusCode} ${response.statusMessage}`,
            );
        });

        next();
    }
}
