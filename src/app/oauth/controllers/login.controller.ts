import {
    Body,
    Controller,
    Get,
    Post,
    Render,
    Req,
    Res,
    HttpStatus,
    UnauthorizedException,
} from '@nestjs/common';
import type { Response, Request } from 'express';
import { requestFromExpress } from '@jmondi/oauth2-server/express';
import { User } from '@prisma/client';
import { DateDuration } from '@jmondi/date-duration';
import { IsEmail, IsString } from 'class-validator';

import { AuthorizationServerService } from '../services/authorization_server.service.js';
import { PrismaService } from '../../prisma/prisma.service.js';
import { verifyPasswordOrThrow } from '../../../lib/password.js';
import { JothJwtService } from '../services/jwt_service.js';
import { createUrl, Pathnames } from '../../../lib/url.js';
import { createSessionCookie } from '../../../lib/session.js';

export class LoginBody {
    @IsEmail()
    email: string;
    @IsString()
    password: string;
}

enum LoginErrors {
    BadCredentials = '1'
};

function getErrorMessage(code: any): string | null {
    if (!code || typeof code !== 'string') return null;
    
    switch(code) {
        case LoginErrors.BadCredentials:
            return 'Incorrect email or password!';
        default:
            return 'An unknown error occurred.';
    }
}

@Controller(Pathnames.login)
export class LoginController {
    constructor(
        private readonly jwt: JothJwtService,
        private readonly oauth: AuthorizationServerService,
        private readonly prisma: PrismaService,
    ) {}

    @Get()
    @Render('login')
    async index(@Req() req: Request, @Res() res: Response) {
        await this.oauth.validateAuthorizationRequest(requestFromExpress(req));

        const signupUrl = createUrl(`${Pathnames.prefix}${Pathnames.signup}`, req.query);
        signupUrl.searchParams.delete('fail_code');

        return {
            csrfToken: req.csrfToken(),
            loginFormAction: '#',
            errorMessage: getErrorMessage(req.query.fail_code),
            signupUrl: signupUrl.toString()
        };
    }

    @Post()
    async post(
        @Req() req: Request,
        @Res({ passthrough: true }) res: Response,
        @Body() body: LoginBody,
    ) {
        const redirectWithFail = (code: string) => {
            const redirectUrl = createUrl(`${Pathnames.prefix}${Pathnames.login}`, req.query);
            redirectUrl.searchParams.set('fail_code', code);

            res.redirect(redirectUrl.toString());
        }

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

        const redirectUrl = createUrl(`${Pathnames.prefix}${Pathnames.authorize}`, req.query);
        
        // delete unnecessary search params (if they are present)
        redirectUrl.searchParams.delete('clear_session');
        redirectUrl.searchParams.delete('fail_code');

        res.status(HttpStatus.FOUND).redirect(redirectUrl.toString());
    }
}
