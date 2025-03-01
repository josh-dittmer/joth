import { Module } from '@nestjs/common';

import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { LoggerModule } from '../logging/logger.module.js';
import { AppController } from './app.controller.js';
import { OAuthModule } from './oauth/oauth.module.js';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

@Module({
    imports: [
        OAuthModule,
        LoggerModule,
        ServeStaticModule.forRoot({
            rootPath: join(__dirname, '..', '..', 'public'),
            serveRoot: '/public',
            exclude: ['/api/(.*)'],
            serveStaticOptions: {
                index: false,
            },
        }),
    ],
    controllers: [AppController],
})
export class AppModule { }
