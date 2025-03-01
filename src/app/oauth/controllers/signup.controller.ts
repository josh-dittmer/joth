import { requestFromExpress } from '@jmondi/oauth2-server/express';
import { Body, Controller, Get, HttpStatus, Post, Render, Req, Res } from '@nestjs/common';
import { IsEmail, IsString } from 'class-validator';
import { Request, Response } from 'express';
import { API_PREFIX, PATHS } from '../../../lib/common/values.js';
import { setPassword } from '../../../lib/password.js';
import { createSessionCookie } from '../../../lib/session.js';
import { createUrl } from '../../../lib/url.js';
import { DBService } from '../../db/services/db.service.js';
import { AuthorizationServerService } from '../services/authorization_server.service.js';
import { JothJwtService } from '../services/jwt_service.js';

export class SignupBody {
    @IsEmail()
    email: string;

    @IsString()
    password: string;

    @IsString()
    passwordVerification: string;
}

enum SignupErrors {
    PasswordMismatch = '1',
    WeakPassword = '2',
    EmailTaken = '3',
}

const MIN_PASSWORD_LENGTH = 4;

function getErrorMessage(code: any): string | null {
    if (!code || typeof code !== 'string') return null;

    switch (code) {
        case SignupErrors.PasswordMismatch:
            return 'The passwords do not match!';
        case SignupErrors.WeakPassword:
            return `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`;
        case SignupErrors.EmailTaken:
            return 'The specified email is already taken!';
        default:
            return 'An unknown error occurred.';
    }
}

@Controller(PATHS.signup)
export class SignupController {
    constructor(
        private readonly jwt: JothJwtService,
        private readonly oauth: AuthorizationServerService,
        private readonly prisma: DBService,
    ) { }

    @Get()
    @Render('signup')
    async index(@Req() req: Request, @Res() res: Response) {
        await this.oauth.validateAuthorizationRequest(requestFromExpress(req));

        const loginUrl = createUrl(req.secure, req.host, `${API_PREFIX}/${PATHS.login}`, req.query);
        loginUrl.searchParams.delete('fail_code');

        return {
            csrfToken: req.csrfToken(),
            signupFormAction: '#',
            errorMessage: getErrorMessage(req.query.fail_code),
            loginUrl: loginUrl,
        };
    }

    @Post()
    async post(
        @Req() req: Request,
        @Res({ passthrough: true }) res: Response,
        @Body() body: SignupBody,
    ) {
        const redirectWithFail = (code: string) => {
            const redirectUrl = createUrl(req.secure, req.host, `${API_PREFIX}/${PATHS.signup}`, req.query);
            redirectUrl.searchParams.set('fail_code', code);

            res.redirect(redirectUrl.toString());
        };

        await this.oauth.validateAuthorizationRequest(req);

        const { email, password, passwordVerification } = body;

        if (password !== passwordVerification) {
            return redirectWithFail(SignupErrors.PasswordMismatch);
        } else if (password.length < MIN_PASSWORD_LENGTH) {
            return redirectWithFail(SignupErrors.WeakPassword);
        }

        const user = await this.prisma.user.findUnique({
            where: { email: email },
        });

        if (user) {
            return redirectWithFail(SignupErrors.EmailTaken);
        }

        const currDate = new Date();

        const newUser = await this.prisma.user.create({
            data: {
                email: email,
                passwordHash: await setPassword(password),
                lastLoginAt: currDate,
                lastLoginIP: req.ip,
                createdIP: req.ip,
                updatedAt: currDate,
            },
        });

        await createSessionCookie(newUser, this.jwt, res);

        const redirectUrl = createUrl(req.secure, req.host, `${API_PREFIX}/${PATHS.authorize}`, req.query);

        // delete unnecessary search params (if they are present)
        redirectUrl.searchParams.delete('clear_session');
        redirectUrl.searchParams.delete('fail_code');

        res.status(HttpStatus.FOUND).redirect(redirectUrl.toString());
    }
}
