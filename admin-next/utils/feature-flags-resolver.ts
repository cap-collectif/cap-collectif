import getRedisClient from './redis-client';
import { FeatureFlags } from '../types';

export const defaultFeatureFlags: FeatureFlags = {
    report_browers_errors_to_sentry: false,
    unstable__remote_events: false,
    login_saml: false,
    login_paris: false,
    disconnect_openid: false,
    votes_min: false,
    blog: false,
    calendar: false,
    login_facebook: false,
    privacy_policy: false,
    members_list: false,
    captcha: false,
    unstable__admin_editor: false,
    new_feature_questionnaire_result: false,
    consent_external_communication: false,
    consent_internal_communication: false,
    newsletter: false,
    profiles: false,
    projects_form: false,
    project_trash: false,
    search: false,
    share_buttons: false,
    shield_mode: false,
    registration: false,
    phone_confirmation: false,
    reporting: false,
    themes: false,
    districts: false,
    user_type: false,
    votes_evolution: false,
    restrict_registration_via_email_domain: false,
    export: false,
    server_side_rendering: false,
    zipcode_at_register: false,
    consultation_plan: false,
    display_map: false,
    sso_by_pass_auth: false,
    allow_users_to_propose_events: false,
    secure_password: false,
    restrict_connection: false,
    login_franceconnect: false,
    read_more: false,
    display_pictures_in_depository_proposals_list: false,
    external_project: false,
    app_news: false,
    multilangue: false,
    display_pictures_in_event_list: false,
    unstable__analysis: false,
    unstable__emailing: false,
    unstable__emailing_parameters: false,
    proposal_revisions: false,
    unstable__tipsmeee: false,
    unstable__new_consultation_page: false,
    unstable__new_project_card: false,
    import_proposals: false,
    unstable__analytics_page: false,
    http_redirects: false,
    unstable_project_admin: false,
    developer_documentation: false,
    export_legacy_users: false,
    graphql_query_analytics: false,
    unstable__paper_vote: false,
};

const getRedisFeatureFlagKey = (flag: string) => {
    return `feature_toggle__TOGGLE__${flag}`;
};

export const decodePHPFlag = (encodedFlag: string): boolean => {
    return encodedFlag.includes('i:1;}');
};

const getFeatureFlags = async (): FeatureFlags => {
    const redisClient = await getRedisClient();

    const featureFlags = defaultFeatureFlags;

    for (const flag of Object.keys(featureFlags)) {
        const flagKey = getRedisFeatureFlagKey(flag);
        const encodedPHPFlag: string | null = await redisClient.get(flagKey);
        featureFlags[flag] = encodedPHPFlag ? decodePHPFlag(encodedPHPFlag) : !!encodedPHPFlag;
    }

    return featureFlags;
};

export default getFeatureFlags;
