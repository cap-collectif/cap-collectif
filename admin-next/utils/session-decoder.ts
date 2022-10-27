import {ViewerSession} from "../types";

const SESSION_SEPARATOR = '___JSON_SESSION_SEPARATOR__';

export default function getViewerJsonFromRedisSession(session: string): ViewerSession | null {
    const jsonSession = session.split(SESSION_SEPARATOR)[1];
    if (!jsonSession || !jsonSession.length) {
        console.error('The Json session is empty !');
        console.debug({ session });
        return null;
    }

    try {
        return JSON.parse(jsonSession).viewer;
    } catch (e) {
        console.error('The Json session could not be parsed !');
        console.debug({ jsonSession });
        return null;
    }
}
