import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response } from 'express';
import { DBService } from '../../db/services/db.service.js';
import { JothJwtService } from '../services/jwt_service.js';

@Injectable()
export class UserMiddleware implements NestMiddleware {
    constructor(
        private readonly prisma: DBService,
        private readonly jwt: JothJwtService,
    ) { }

    async use(req: Request, _res: Response, next: () => void) {
        const jid = req.cookies.jid;

        if (!jid) return next();

        let userId: string | undefined;

        try {
            const decoded: { userId?: string } = await this.jwt.verify(jid);
            userId = decoded?.userId;
        } catch (e) {
            return next();
        }

        if (!userId) return next();

        const user = await this.prisma.user.findUnique({
            where: { id: userId },
        });

        if (!user) return next();

        req.user = user;

        next();
    }
}
