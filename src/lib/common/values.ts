export const DATABASE_URL = process.env.DATABASE_URL!;

export const API_PREFIX = '/api/v1';
export const API_PORT = process.env.API_PORT!;

export const PRIVATE_KEY_PATH = process.env.PRIVATE_KEY_PATH!;
export const PUBLIC_KEY_PATH = process.env.PUBLIC_KEY_PATH!;

export const CORS_ALLOWED_ORIGIN = process.env.CORS_ALLOWED_ORIGIN!;

export const CSRF_SECRET = process.env.CSRF_SECRET!;
export const COOKIE_SECRET = process.env.COOKIE_SECRET!;

export const LOG_LEVEL = process.env.LOG_LEVEL!;

export const ACCESS_TOKEN_LIFETIME = process.env.ACCESS_TOKEN_LIFETIME!;
export const REFRESH_TOKEN_LIFETIME = process.env.REFRESH_TOKEN_LIFETIME!;
export const SESSION_LIFETIME = process.env.SESSION_LIFETIME!;
export const AUTH_CODE_LIFETIME = process.env.AUTH_CODE_LIFETIME!;

export const PATHS = {
    authorize: 'oauth2/authorize',
    token: 'oauth2/token',
    revoke: 'oauth2/revoke',
    login: 'login',
    signup: 'signup'
};
