import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';

//import { PRIVATE_KEY_PATH, PUBLIC_KEY_PATH } from '../../lib/common/values.js';
import { PRIVATE_KEY_PATH, PUBLIC_KEY_PATH } from '../../lib/common/values.js';
import { csrf } from '../../lib/csrf.js';
import { LoggerMiddleware } from '../../logging/middleware/logger.middleware.js';
import { DBModule } from '../db/db.module.js';
import { AuthorizationController } from './controllers/authorization.controller.js';
import { LoginController } from './controllers/login.controller.js';
import { RevokeController } from './controllers/revoke.controller.js';
import { SignupController } from './controllers/signup.controller.js';
import { TokenController } from './controllers/token.controller.js';
import { UserMiddleware } from './middleware/user.middleware.js';
import { AuthorizationServerService } from './services/authorization_server.service.js';
import { JothJwtService } from './services/jwt_service.js';

@Module({
    imports: [DBModule],
    controllers: [
        AuthorizationController,
        RevokeController,
        TokenController,
        LoginController,
        SignupController,
    ],
    providers: [
        JothJwtService.register(PRIVATE_KEY_PATH, PUBLIC_KEY_PATH),
        AuthorizationServerService.register({
            requiresPKCE: true,
            requiresS256: true,
        })
    ],
    exports: [AuthorizationServerService],
})
export class OAuthModule implements NestModule {
    configure(consumer: MiddlewareConsumer) {
        consumer
            .apply(csrf.doubleCsrfProtection)
            .forRoutes(LoginController, SignupController);
        consumer.apply(UserMiddleware).forRoutes('*path');
        consumer.apply(LoggerMiddleware).forRoutes('*path');
    }
}
