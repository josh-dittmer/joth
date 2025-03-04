import {
    AuthorizationServerOptions,
    DateInterval,
    AuthorizationServer as JmondiAuthServer,
} from '@jmondi/oauth2-server';
import { Injectable, Provider } from '@nestjs/common';

import { ACCESS_TOKEN_LIFETIME } from '../../../lib/common/values.js';
import { DBService } from '../../db/services/db.service.js';
import { AuthCodeRepository } from '../repositories/auth_code_repository.js';
import { ClientRepository } from '../repositories/client_repository.js';
import { ScopeRepository } from '../repositories/scope_repository.js';
import { TokenRepository } from '../repositories/token_repository.js';
import { UserRepository } from '../repositories/user_repository.js';
import { JothJwtService } from './jwt_service.js';

@Injectable()
export class AuthorizationServerService extends JmondiAuthServer {
    static register(options?: Partial<AuthorizationServerOptions>): Provider {
        return {
            provide: AuthorizationServerService,
            useFactory: (prisma: DBService, jwt: JothJwtService) => {
                const authCodeRepository = new AuthCodeRepository(prisma);
                const userRepository = new UserRepository(prisma);
                const authorizationServer = new AuthorizationServerService(
                    new ClientRepository(prisma),
                    new TokenRepository(prisma),
                    new ScopeRepository(prisma),
                    jwt,
                    options,
                );
                authorizationServer.enableGrantTypes(
                    ['refresh_token', new DateInterval(`${ACCESS_TOKEN_LIFETIME}s`)],
                    [
                        { grant: 'authorization_code', authCodeRepository, userRepository },
                        new DateInterval(`${ACCESS_TOKEN_LIFETIME}s`),
                    ],
                );
                return authorizationServer;
            },
            inject: [DBService, JothJwtService],
        };
    }
}
