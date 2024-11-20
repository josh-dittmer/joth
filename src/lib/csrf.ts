import 'dotenv/config';
import { doubleCsrf } from 'csrf-csrf';

export const csrf = doubleCsrf({
    getSecret: _req => process.env.CSRF_SECRET!,
    // __Host-psifi.x-csrf-token does not work with localhost
    cookieName: 'x-csrf-token',
    cookieOptions: {
        httpOnly: true,
        // sameSite: "strict",
        path: '/',
        secure: true,
    },
    getTokenFromRequest: req => req.body._csrf, // A function that returns the token from the request
});
