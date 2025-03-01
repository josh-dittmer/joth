import { ExtraAccessTokenFieldArgs, JwtService } from '@jmondi/oauth2-server';
import { Injectable } from '@nestjs/common';
import fs from 'fs';
import { KEY_PATH } from '../../../lib/common/values.js';

@Injectable()
export class JothJwtService extends JwtService {
    extraTokenFields({ user, client }: ExtraAccessTokenFieldArgs) {
        return {
            email: user?.email,
            client: client.name,
        };
    }

    static register() {
        const key = fs.readFileSync(KEY_PATH);

        return {
            provide: JothJwtService,
            useFactory: () => new JothJwtService(key),
        };
    }
}
