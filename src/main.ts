import 'dotenv/config';
import 'reflect-metadata';

import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import type { NestExpressApplication } from '@nestjs/platform-express';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import nunjucks from 'nunjucks';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
import cors from 'cors';

import { AppModule } from './app.module.js';
import { LocalLogger } from './logging/local-logger.js';
import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface.js';
import { Pathnames } from './lib/url.js';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

async function bootstrap() {
    const app = await NestFactory.create<NestExpressApplication>(AppModule, {
        logger: (process.env.LOGGING_ENABLED!.toLowerCase() === 'true') ? new LocalLogger('App') : false,
    });

    const corsOptions: CorsOptions = {
        origin: process.env.CORS_ALLOWED_ORIGIN!
    };

    app.use(bodyParser.urlencoded({ extended: false }));
    app.use(bodyParser.json());
    app.use(cors(corsOptions))
    app.use(cookieParser(process.env.COOKIE_SECRET!));

    const templatesDir = join(__dirname, '..', '..', 'views');
    nunjucks.configure(templatesDir, {
        autoescape: true,
        express: app,
    });
    app.setViewEngine('njk');
    app.useGlobalPipes(
        new ValidationPipe({
            transform: true,
            enableDebugMessages: process.env.LOGGING_ENABLED!.toLowerCase() === 'true',
        }),
    );
    app.setGlobalPrefix(Pathnames.prefix);

    await app.listen(process.env.API_PORT!);

    console.log(`Listening on port ${process.env.API_PORT!}`);
}

bootstrap().then().catch(console.error);
