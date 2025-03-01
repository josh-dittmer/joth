export function createUrl(secure: boolean, host: string, pathname: string, queryParams: qs.ParsedQs): URL {
    const url = new URL(`${secure ? 'https://' : 'http://'}${host}${pathname}`);

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
