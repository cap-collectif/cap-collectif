import { FeatureFlagType } from '@relay/useFeatureFlagQuery.graphql';

export type SymfonyEnv = 'dev' | 'prod' | 'test';

export type PageProps = {
    viewerSession: ViewerSession;
    appVersion: string;
};

export enum Locale {
    frFR = 'fr-FR',
    enGB = 'en-GB',
    esES = 'es-ES',
    deDE = 'de-DE',
    nlNL = 'nl-NL',
    svSE = 'sv-SE',
    ocOC = 'oc-OC',
    euEU = 'eu-EU',
}

export type ViewerSession = {
    email: string;
    username: string;
    id: string;
    isAdmin: boolean;
    isSuperAdmin: boolean;
    isProjectAdmin: boolean;
    isAdminOrganization: boolean;
    isOrganizationMember: boolean;
    organization: string | null;
};

export type FeatureFlags = {
    [key in FeatureFlagType]: boolean;
};

export type IntlType = {
    locale: Locale;
    messages: {
        [key: string]: string;
    };
};
