import { Module } from '@nestjs/common';
import { JothLogger } from './services/logger.service.js';

@Module({
    providers: [JothLogger.register()],
    exports: [JothLogger],
})
export class LoggerModule { }
