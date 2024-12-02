<?php

namespace Capco\AppBundle\Toggle;

use Capco\AppBundle\Event\ToggleFeatureEvent;
use Qandidate\Toggle\Context;
use Qandidate\Toggle\ContextFactory;
use Qandidate\Toggle\Toggle;
use Qandidate\Toggle\ToggleManager;
use Symfony\Contracts\EventDispatcher\EventDispatcherInterface;

class Manager
{
    final public const noindex_on_profiles = 'noindex_on_profiles';
    final public const graphql_query_analytics = 'graphql_query_analytics';
    final public const questionnaire_result = 'questionnaire_result';
    final public const blog = 'blog';
    final public const calendar = 'calendar';
    final public const captcha = 'captcha';
    final public const turnstile_captcha = 'turnstile_captcha';
    final public const consent_external_communication = 'consent_external_communication';
    final public const developer_documentation = 'developer_documentation';
    final public const public_api = 'public_api';
    final public const graphql_introspection = 'graphql_introspection';
    final public const login_facebook = 'login_facebook';
    final public const login_saml = 'login_saml';
    final public const login_cas = 'login_cas';
    final public const votes_min = 'votes_min';
    final public const privacy_policy = 'privacy_policy';
    final public const members_list = 'members_list';
    final public const newsletter = 'newsletter';
    final public const profiles = 'profiles';
    final public const projects_form = 'projects_form';
    final public const project_trash = 'project_trash';
    final public const search = 'search';
    final public const share_buttons = 'share_buttons';
    final public const shield_mode = 'shield_mode';
    final public const registration = 'registration';
    final public const restrict_registration_via_email_domain = 'restrict_registration_via_email_domain';
    final public const themes = 'themes';
    final public const export = 'export';
    final public const districts = 'districts';
    final public const user_type = 'user_type';
    final public const votes_evolution = 'votes_evolution';
    final public const server_side_rendering = 'server_side_rendering';
    final public const zipcode_at_register = 'zipcode_at_register';
    final public const indexation = 'indexation';
    final public const consultation_plan = 'consultation_plan';
    final public const display_map = 'display_map';
    final public const consent_internal_communication = 'consent_internal_communication';
    final public const oauth2_switch_user = 'oauth2_switch_user';
    final public const sso_by_pass_auth = 'sso_by_pass_auth';
    final public const allow_users_to_propose_events = 'allow_users_to_propose_events';
    final public const login_franceconnect = 'login_franceconnect';
    final public const restrict_connection = 'restrict_connection';
    final public const secure_password = 'secure_password';
    final public const read_more = 'read_more';
    final public const remind_user_account_confirmation = 'remind_user_account_confirmation';
    final public const display_pictures_in_depository_proposals_list = 'display_pictures_in_depository_proposals_list';
    final public const display_pictures_in_event_list = 'display_pictures_in_event_list';
    final public const external_project = 'external_project';
    final public const sentry_log = 'sentry_log';
    final public const login_openid = 'login_openid';
    final public const versions = 'versions';
    final public const multilangue = 'multilangue';
    final public const http_redirects = 'http_redirects';
    final public const report_browers_errors_to_sentry = 'report_browers_errors_to_sentry';
    final public const phone_confirmation = 'phone_confirmation';
    final public const reporting = 'reporting';
    final public const emailing = 'emailing';
    final public const emailing_parameters = 'emailing_parameters';
    final public const emailing_group = 'emailing_group';
    final public const proposal_revisions = 'proposal_revisions';
    final public const new_project_card = 'new_project_card';
    final public const export_legacy_users = 'export_legacy_users';
    final public const import_proposals = 'import_proposals';
    final public const analytics_page = 'analytics_page';
    final public const project_admin = 'project_admin';
    final public const anonymous_questionnaire = 'anonymous_questionnaire';
    final public const twilio = 'twilio';
    final public const paper_vote = 'paper_vote';
    final public const helpscout_beacon = 'helpscout_beacon';
    final public const api_sendinblue = 'api_sendinblue';
    final public const proposal_sms_vote = 'proposal_sms_vote';
    final public const organizations = 'organizations';
    final public const moderation_comment = 'moderation_comment';
    final public const unstable__new_create_project = 'unstable__new_create_project';
    final public const new_vote_step = 'new_vote_step';
    final public const mediator = 'mediator';
    final public const online_help = 'online_help';
    final public const full_proposal_card = 'full_proposal_card';
    final public const new_navbar = 'new_navbar';
    final public const multi_consultations = 'multi_consultations';

    final public const ADMIN_ALLOWED_FEATURES = [
        self::blog,
        self::calendar,
        self::consultation_plan,
        self::privacy_policy,
        self::display_map,
        self::versions,
        self::themes,
        self::districts,
        self::members_list,
        self::profiles,
        self::reporting,
        self::newsletter,
        self::share_buttons,
        self::search,
        self::display_pictures_in_depository_proposals_list,
        self::display_pictures_in_event_list,
        self::external_project,
        self::read_more,
        self::secure_password,
        self::restrict_connection,
        self::public_api,
        self::graphql_introspection,
        self::developer_documentation,
        self::new_project_card,
        self::paper_vote,
        self::projects_form,
        self::project_trash,
        self::mediator,
        self::online_help,
        self::full_proposal_card,
        self::new_navbar,
        self::multi_consultations,
    ];

    public static $toggles = [
        self::noindex_on_profiles,
        self::graphql_query_analytics,
        self::questionnaire_result,
        self::blog,
        self::calendar,
        self::captcha,
        self::turnstile_captcha,
        self::consent_external_communication,
        self::developer_documentation,
        self::public_api,
        self::graphql_introspection,
        self::votes_min,
        self::login_facebook,
        self::login_saml,
        self::login_cas,
        self::login_openid,
        self::privacy_policy,
        self::members_list,
        self::newsletter,
        self::profiles,
        self::projects_form,
        self::project_trash,
        self::search,
        self::share_buttons,
        self::shield_mode,
        self::registration,
        self::phone_confirmation,
        self::reporting,
        self::restrict_registration_via_email_domain,
        self::themes,
        self::export,
        self::districts,
        self::user_type,
        self::votes_evolution,
        self::server_side_rendering,
        self::zipcode_at_register,
        self::indexation,
        self::consultation_plan,
        self::display_map,
        self::consent_internal_communication,
        self::oauth2_switch_user,
        self::sso_by_pass_auth,
        self::allow_users_to_propose_events,
        self::login_franceconnect,
        self::restrict_connection,
        self::secure_password,
        self::read_more,
        self::remind_user_account_confirmation,
        self::display_pictures_in_depository_proposals_list,
        self::display_pictures_in_event_list,
        self::external_project,
        self::sentry_log,
        self::multilangue,
        self::http_redirects,
        self::report_browers_errors_to_sentry,
        self::emailing,
        self::emailing_parameters,
        self::emailing_group,
        self::proposal_revisions,
        self::new_project_card,
        self::export_legacy_users,
        self::import_proposals,
        self::analytics_page,
        self::project_admin,
        self::anonymous_questionnaire,
        self::twilio,
        self::paper_vote,
        self::helpscout_beacon,
        self::api_sendinblue,
        self::proposal_sms_vote,
        self::organizations,
        self::moderation_comment,
        self::unstable__new_create_project,
        self::new_vote_step,
        self::mediator,
        self::online_help,
        self::full_proposal_card,
        self::new_navbar,
        self::multi_consultations,
    ];

    protected Context $context;

    protected array $knownValues = [];

    public function __construct(
        protected ToggleManager $toggleManager,
        ContextFactory $contextFactory,
        private readonly EventDispatcherInterface $dispatcher
    ) {
        $this->context = $contextFactory->createContext();
    }

    public function exists(string $name): bool
    {
        return \in_array($name, self::$toggles, true);
    }

    public function activate(string $name): void
    {
        $toggle = $this->createToggle($name, Toggle::ALWAYS_ACTIVE);
        $this->dispatchEvent($toggle);
        $this->toggleManager->add($toggle);
    }

    public function activateAll(): void
    {
        foreach (self::$toggles as $name) {
            $this->activate($name);
        }
    }

    public function all(?bool $state = null): array
    {
        // features are disabled by default
        $return = [];

        foreach (self::$toggles as $name) {
            if (!$state || $state === $this->isActive($name)) {
                $return[$name] = $this->isActive($name);
            }
        }

        ksort($return);

        return $return;
    }

    public function deactivate(string $name): void
    {
        $toggle = $this->createToggle($name, Toggle::INACTIVE);
        $this->dispatchEvent($toggle);
        $this->toggleManager->add($toggle);
    }

    public function deactivateAll(): void
    {
        foreach (self::$toggles as $name) {
            $this->deactivate($name);
        }
    }

    public function isActive(string $name): bool
    {
        if (!isset($this->knownValues[$name])) {
            $this->knownValues[$name] = $this->toggleManager->active($name, $this->context);
        }

        return $this->knownValues[$name];
    }

    public function hasOneActive(array $names): bool
    {
        if (0 === \count($names)) {
            return true;
        }

        foreach ($names as $name) {
            if ($this->isActive($name)) {
                return true;
            }
        }

        return false;
    }

    public function switchValue(string $name): bool
    {
        $value = $this->isActive($name);

        if ($value) {
            $this->deactivate($name);
        } else {
            $this->activate($name);
        }

        return !$value;
    }

    public function containsEnabledFeature(array $features): bool
    {
        if (empty($features)) {
            return true;
        }

        foreach ($features as $feature) {
            if (isset($this->all(true)[$feature])) {
                return true;
            }
        }

        return false;
    }

    public function set(string $name, bool $value): void
    {
        $value ? $this->activate($name) : $this->deactivate($name);
    }

    public function getToggleManager(): ToggleManager
    {
        return $this->toggleManager;
    }

    public function dispatchEvent(Toggle $toggle)
    {
        $event = new ToggleFeatureEvent($toggle);
        $this->dispatcher->dispatch($event, $event::NAME);
    }

    private function createToggle(string $name, int $status, array $conditions = []): Toggle
    {
        $toggle = new Toggle($name, $conditions);

        if (Toggle::INACTIVE === $status) {
            $toggle->deactivate();
        } else {
            $toggle->activate($status);
        }

        return $toggle;
    }
}
