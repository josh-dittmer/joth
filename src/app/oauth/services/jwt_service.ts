import 'dotenv/config';
import { ExtraAccessTokenFieldArgs, JwtService } from '@jmondi/oauth2-server';
import { Injectable } from '@nestjs/common';
import { Secret } from 'jsonwebtoken';
import fs from 'fs';

@Injectable()
export class JothJwtService extends JwtService {
    extraTokenFields({ user, client }: ExtraAccessTokenFieldArgs) {
        return {
            email: user?.email,
            client: client.name,
        };
    }

    static register() {
        const key = fs.readFileSync('./keys/private.key');

        return {
            provide: JothJwtService,
            useFactory: () => new JothJwtService(key),
        };
    }
}
