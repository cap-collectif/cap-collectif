<?php

namespace Capco\AdminBundle\Resolver;

use Capco\AppBundle\Enum\UserRole;
use Capco\AppBundle\Toggle\Manager;
use Symfony\Component\Security\Core\Authorization\AuthorizationCheckerInterface;

class FeaturesCategoryResolver
{
    protected static array $categories = [
        'pages.homepage' => ['conditions' => [], 'features' => []],
        'pages.blog' => ['conditions' => ['blog'], 'features' => []],
        'pages.events' => [
            'conditions' => ['calendar'],
            'features' => [
                UserRole::ROLE_SUPER_ADMIN => [],
                UserRole::ROLE_ADMIN => [Manager::allow_users_to_propose_events],
            ],
        ],
        'pages.themes' => ['conditions' => ['themes'], 'features' => []],
        'pages.projects' => ['conditions' => [], 'features' => ['projects_form', 'project_trash']],
        'pages.registration' => [
            'conditions' => [],
            'features' => ['user_type', 'zipcode_at_register'],
        ],
        'pages.members' => ['conditions' => ['members_list'], 'features' => []],
        'pages.login' => ['conditions' => [], 'features' => []],
        'pages.footer' => ['conditions' => [], 'features' => []],
        'pages.cookies' => ['conditions' => [], 'features' => []],
        'pages.privacy' => ['conditions' => [], 'features' => []],
        'pages.legal' => ['conditions' => [], 'features' => []],
        'pages.charter' => ['conditions' => [], 'features' => []],
        'pages.shield' => ['conditions' => [], 'features' => ['shield_mode']],
        'settings.global' => ['conditions' => [], 'features' => []],
        'settings.performance' => ['conditions' => [], 'features' => []],
        'settings.modules' => [
            'conditions' => [],
            'features' => [
                UserRole::ROLE_ADMIN => Manager::ADMIN_ALLOWED_FEATURES,
                UserRole::ROLE_SUPER_ADMIN => [
                    Manager::votes_min,
                    Manager::oauth2_switch_user,
                    Manager::votes_evolution,
                    Manager::remind_user_account_confirmation,
                    Manager::server_side_rendering,
                    Manager::export,
                    Manager::export_legacy_users,
                    Manager::indexation,
                    Manager::questionnaire_result,
                    Manager::display_pictures_in_event_list,
                    Manager::multilangue,
                    Manager::sentry_log,
                    Manager::login_openid,
                    Manager::login_saml,
                    Manager::login_cas,
                    Manager::login_franceconnect,
                    Manager::report_browers_errors_to_sentry,
                    Manager::http_redirects,
                    Manager::emailing,
                    Manager::emailing_parameters,
                    Manager::proposal_revisions,
                    Manager::import_proposals,
                    Manager::analytics_page,
                    Manager::project_admin,
                    Manager::noindex_on_profiles,
                    Manager::anonymous_questionnaire,
                    Manager::twilio,
                    Manager::paper_vote,
                    Manager::helpscout_beacon,
                    Manager::api_sendinblue,
                    Manager::organizations,
                    Manager::moderation_comment,
                    Manager::unstable__new_create_project,
                    Manager::mediator,
                    Manager::online_help,
                    Manager::full_proposal_card,
                    Manager::multi_consultations,
                    Manager::collect_proposals_by_email,
                ],
            ],
        ],
        'settings.notifications' => ['conditions' => [], 'features' => []],
        'settings.appearance' => ['conditions' => [], 'features' => []],
    ];

    public function __construct(protected Manager $manager, protected AuthorizationCheckerInterface $authorizationChecker)
    {
    }

    public function isCategoryEnabled(string $category): bool
    {
        if (!isset(self::$categories[$category])) {
            return false;
        }

        return $this->manager->hasOneActive(self::$categories[$category]['conditions']);
    }

    public function isAdminEnabled(/* User */ $admin): bool
    {
        if (method_exists($admin, 'getFeatures')) {
            return $this->manager->hasOneActive($admin->getFeatures());
        }

        return true;
    }

    public function getTogglesByCategory(string $category): array
    {
        $toggles = [];

        // If all the category have the same structure remove those conditions about the category name.
        if (
            isset(self::$categories[$category])
            && ('settings.modules' === $category || 'pages.events' === $category)
        ) {
            foreach (self::$categories[$category]['features'] as $access => $features) {
                if ($this->authorizationChecker->isGranted($access)) {
                    foreach ($features as $feature) {
                        $toggles[$feature] = [
                            'active' => $this->manager->isActive($feature),
                            'access' => $access,
                        ];
                    }
                }
            }
        } elseif (isset(self::$categories[$category])) {
            foreach (self::$categories[$category]['features'] as $feature) {
                if ($this->authorizationChecker->isGranted(UserRole::ROLE_ADMIN)) {
                    $toggles[$feature] = [
                        'active' => $this->manager->isActive($feature),
                    ];
                }
            }
        }

        return $toggles;
    }

    public function findCategoryForToggle(string $toggle): ?string
    {
        foreach (self::$categories as $name => $category) {
            if (
                ('settings.modules' === $name || 'pages.events' === $name)
                && \in_array(
                    $toggle,
                    array_merge(
                        $category['features'][UserRole::ROLE_ADMIN],
                        $category['features'][UserRole::ROLE_SUPER_ADMIN]
                    ),
                    true
                )
            ) {
                return $name;
            }
            if (\in_array($toggle, $category['features'], true)) {
                return $name;
            }
        }

        return null;
    }

    public function getEnabledPagesCategories(): array
    {
        $categories = [];
        foreach (self::$categories as $name => $cat) {
            if (
                0 === strrpos($name, 'pages.')
                && $this->manager->hasOneActive($cat['conditions'])
            ) {
                $categories[] = $name;
            }
        }

        return $categories;
    }

    public function getEnabledSettingsCategories(): array
    {
        $categories = [];
        foreach (self::$categories as $name => $cat) {
            if (
                0 === strrpos($name, 'settings.')
                && $this->manager->hasOneActive($cat['conditions'])
            ) {
                $categories[] = $name;
            }
        }

        return $categories;
    }

    public function getGroupNameForCategory(string $category): ?string
    {
        if (0 === strrpos($category, 'settings.')) {
            return 'admin.group.parameters';
        }
        if (0 === strrpos($category, 'pages.')) {
            return 'admin.group.pages';
        }

        return null;
    }
}
