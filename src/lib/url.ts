export const Pathnames = {
    prefix: '/api/v1/',
    authorize: 'oauth2/authorize',
    token: 'oauth2/token',
    revoke: 'oauth2/revoke',
    login: 'login',
    signup: 'signup'
}

export function createUrl(pathname: string, queryParams: qs.ParsedQs): URL {
    const url = new URL(`${process.env.SELF_URL!}${pathname}`);

    for(const param in queryParams) {
        const value = queryParams[param];
        if (!value) continue;

        if (Array.isArray(value)) {
            value.forEach(v => url.searchParams.append(param, v));
        }

        else if (typeof value === 'string') {
            url.searchParams.append(param, value);
        }
    }

    return url;
}