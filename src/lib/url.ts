import { Request } from "express";

export function createUrl(req: Request, pathname: string, queryParams: qs.ParsedQs): URL {
    const host = req.headers['x-forwarded-for'] || req.host;
    const url = new URL(`${req.secure ? 'https://' : 'http://'}${host}${pathname}`);

    for (const param in queryParams) {
        const value = queryParams[param];
        if (!value) continue;

        if (Array.isArray(value)) {
            continue;
            //value.forEach(v => url.searchParams.append(param, v));
        } else if (typeof value === 'string') {
            url.searchParams.append(param, value);
        }
    }

    return url;
}
