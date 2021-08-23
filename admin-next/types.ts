export type SymfonyEnv = 'dev' | 'prod' | 'test';

export type PageProps = {
    viewerSession: ViewerSession,
    appVersion: string,
};

export type ViewerSession = {
    email: string,
    username: string,
    id: string,
    isAdmin: boolean,
    isSuperAdmin: boolean,
    isProjectAdmin: boolean,
};
