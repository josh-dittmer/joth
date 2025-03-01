import 'reflect-metadata';

import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import nunjucks from 'nunjucks';

import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface.js';
import { AppModule } from './app/app.module.js';
import { API_PORT, API_PREFIX, COOKIE_SECRET, CORS_ALLOWED_ORIGIN } from './lib/common/values.js';
import { JothLogger } from './logging/services/logger.service.js';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

async function bootstrap() {
    const app = await NestFactory.create<NestExpressApplication>(AppModule, {
        bufferLogs: true
    });

    app.useLogger(app.get(JothLogger));

    const corsOptions: CorsOptions = {
        origin: CORS_ALLOWED_ORIGIN,
    };

    app.use(bodyParser.urlencoded({ extended: false }));
    app.use(bodyParser.json());
    app.use(cors(corsOptions));
    app.use(cookieParser(COOKIE_SECRET));

    const templatesDir = join(__dirname, '..', '..', 'views');

    nunjucks.configure(templatesDir, {
        autoescape: true,
        express: app,
    });

    app.setViewEngine('njk');
    app.setGlobalPrefix(API_PREFIX);

    await app.listen(API_PORT);
}

bootstrap();
