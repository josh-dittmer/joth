import { Module } from '@nestjs/common';

import { AppController } from './app.controller.js';
import { OAuthModule } from './app/oauth/oauth.module.js';
import { LoggingModule } from './logging/logging.module.js';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

@Module({
    imports: [
        OAuthModule, 
        LoggingModule,
        ServeStaticModule.forRoot({
            rootPath: join(__dirname, '..', '..', 'public'),
            serveRoot: '/public',
            exclude: ['/api/(.*)'],
            serveStaticOptions: {
                index: false
            }
        })
    ],
    controllers: [AppController],
})
export class AppModule {}
