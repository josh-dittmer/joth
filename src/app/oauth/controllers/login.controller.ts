import { requestFromExpress } from '@jmondi/oauth2-server/express';
import {
    Body,
    Controller,
    Get,
    HttpStatus,
    Post,
    Render,
    Req,
    Res
} from '@nestjs/common';
import { User } from '@prisma/client';
import { IsEmail, IsString } from 'class-validator';
import type { Request, Response } from 'express';

import { API_PREFIX, PATHS } from '../../../lib/common/values.js';
import { verifyPasswordOrThrow } from '../../../lib/password.js';
import { createSessionCookie } from '../../../lib/session.js';
import { createUrl } from '../../../lib/url.js';
import { DBService } from '../../db/services/db.service.js';
import { AuthorizationServerService } from '../services/authorization_server.service.js';
import { JothJwtService } from '../services/jwt_service.js';

export class LoginBody {
    @IsEmail()
    email: string;
    @IsString()
    password: string;
}

enum LoginErrors {
    BadCredentials = '1',
}

function getErrorMessage(code: any): string | null {
    if (!code || typeof code !== 'string') return null;

    switch (code) {
        case LoginErrors.BadCredentials:
            return 'Incorrect email or password!';
        default:
            return 'An unknown error occurred.';
    }
}

@Controller(PATHS.login)
export class LoginController {
    constructor(
        private readonly jwt: JothJwtService,
        private readonly oauth: AuthorizationServerService,
        private readonly prisma: DBService,
    ) { }

    @Get()
    @Render('login')
    async index(@Req() req: Request, @Res() res: Response) {
        await this.oauth.validateAuthorizationRequest(requestFromExpress(req));

        const signupUrl = createUrl(req, `${API_PREFIX}/${PATHS.signup}`, req.query);
        signupUrl.searchParams.delete('fail_code');

        return {
            csrfToken: req.csrfToken(),
            loginFormAction: '#',
            errorMessage: getErrorMessage(req.query.fail_code),
            signupUrl: signupUrl.toString(),
        };
    }

    @Post()
    async post(
        @Req() req: Request,
        @Res({ passthrough: true }) res: Response,
        @Body() body: LoginBody,
    ) {
        const redirectWithFail = (code: string) => {
            const redirectUrl = createUrl(req, `${API_PREFIX}/${PATHS.login}`, req.query);
            redirectUrl.searchParams.set('fail_code', code);

            res.redirect(redirectUrl.toString());
        };

        await this.oauth.validateAuthorizationRequest(req);

        const { email, password } = body;
        let user: User;

        try {
            user = await this.prisma.user.findFirstOrThrow({
                where: {
                    email: {
                        equals: email,
                        mode: 'insensitive',
                    },
                },
            });
            await verifyPasswordOrThrow(password, user.passwordHash);
        } catch (e) {
            return redirectWithFail(LoginErrors.BadCredentials);
            //throw new UnauthorizedException(null, { cause: e });
        }

        user = await this.prisma.user.update({
            where: { id: user.id },
            data: {
                lastLoginAt: new Date(),
                lastLoginIP: req.ip,
            },
        });

        await createSessionCookie(user, this.jwt, res);

        const redirectUrl = createUrl(req, `${API_PREFIX}/${PATHS.authorize}`, req.query);

        // delete unnecessary search params (if they are present)
        redirectUrl.searchParams.delete('clear_session');
        redirectUrl.searchParams.delete('fail_code');

        res.status(HttpStatus.FOUND).redirect(redirectUrl.toString());
    }
}
