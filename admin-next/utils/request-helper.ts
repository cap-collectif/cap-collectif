import cookie from 'cookie';
import { NextApiRequest } from 'next';

const SESSION_COOKIE_NAME = 'PHPSESSID';

const getSessionCookieFromReq = (req: NextApiRequest): string | null => {
    const cookieHeader = req && req.headers && req.headers.cookie;
    if (cookieHeader) {
        const cookies = cookie.parse(cookieHeader);
        return cookies[SESSION_COOKIE_NAME];
    }
    return null;
};

export default getSessionCookieFromReq;
