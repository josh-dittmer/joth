import { doubleCsrf } from 'csrf-csrf';
import 'dotenv/config';

export const csrf = doubleCsrf({
    getSecret: _req => process.env.CSRF_SECRET!,
    // __Host-psifi.x-csrf-token does not work with localhost
    cookieName: 'x-csrf-token',
    cookieOptions: {
        httpOnly: true,
        // sameSite: "strict",
        path: '/',
        secure: process.env.NODE_ENV !== 'development',
    },
    getTokenFromRequest: req => req.body._csrf, // A function that returns the token from the request
});
