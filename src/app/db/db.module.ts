import { Module } from '@nestjs/common';
import { DBService } from './services/db.service.js';

@Module({
    providers: [DBService],
    exports: [DBService],
})
export class DBModule { }
