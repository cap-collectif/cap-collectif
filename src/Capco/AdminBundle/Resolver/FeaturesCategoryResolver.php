<?php

namespace Capco\AdminBundle\Resolver;

use Capco\AppBundle\Helper\EnvHelper;
use Capco\AppBundle\Toggle\Manager;
use Symfony\Component\Security\Core\Authorization\AuthorizationCheckerInterface;

class FeaturesCategoryResolver
{
    protected static $categories = [
        'pages.homepage' => ['conditions' => [], 'features' => []],
        'pages.blog' => ['conditions' => ['blog'], 'features' => []],
        'pages.events' => [
            'conditions' => ['calendar'],
            'features' => ['allow_users_to_propose_events']
        ],
        'pages.themes' => ['conditions' => ['themes'], 'features' => []],
        'pages.projects' => ['conditions' => [], 'features' => ['projects_form', 'project_trash']],
        'pages.registration' => [
            'conditions' => [],
            'features' => ['user_type', 'zipcode_at_register']
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
                'blog',
                'calendar',
                'consultation_plan',
                'privacy_policy',
                'display_map',
                'versions',
                'themes',
                'districts',
                'members_list',
                'profiles',
                'reporting',
                'newsletter',
                'share_buttons',
                'search',
                'display_pictures_in_depository_proposals_list'
            ]
        ],
        'settings.notifications' => ['conditions' => [], 'features' => []],
        'settings.appearance' => ['conditions' => [], 'features' => []]
    ];

    protected $manager;
    protected $authorizationChecker;

    public function __construct(
        Manager $manager,
        AuthorizationCheckerInterface $authorizationChecker
    ) {
        $this->manager = $manager;
        $this->authorizationChecker = $authorizationChecker;
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
        if (isset(self::$categories[$category])) {
            foreach (self::$categories[$category]['features'] as $feature) {
                if (
                    'display_map' === $feature &&
                    $this->authorizationChecker->isGranted('ROLE_SUPER_ADMIN')
                ) {
                    $toggles[$feature] = $this->manager->isActive($feature);

                    continue;
                }
                if ('display_map' !== $feature) {
                    $toggles[$feature] = $this->manager->isActive($feature);

                    continue;
                }
            }
        }

        if (
            'settings.modules' === $category &&
            $this->authorizationChecker->isGranted('ROLE_SUPER_ADMIN')
        ) {
            $toggles['read_more'] = $this->manager->isActive('read_more');
            $toggles['developer_documentation'] = $this->manager->isActive(
                'developer_documentation'
            );
            $toggles['public_api'] = $this->manager->isActive('public_api');
            $toggles['votes_evolution'] = $this->manager->isActive('votes_evolution');
            $toggles['server_side_rendering'] = $this->manager->isActive('server_side_rendering');
            $toggles['export'] = $this->manager->isActive('export');
            $toggles['indexation'] = $this->manager->isActive('indexation');
            $toggles['secure_password'] = $this->manager->isActive('secure_password');
            $toggles['restrict_connection'] = $this->manager->isActive('restrict_connection');
            $toggles['new_feature_questionnaire_result'] = $this->manager->isActive(
                'new_feature_questionnaire_result'
            );
        }

        if ('settings.modules' === $category && EnvHelper::get('SYMFONY_LOGIN_SAML_ALLOWED')) {
            $toggles['login_saml'] = $this->manager->isActive('login_saml');
        }

        if ('settings.modules' === $category && EnvHelper::get('SYMFONY_LOGIN_PARIS_ALLOWED')) {
            $toggles['login_paris'] = $this->manager->isActive('login_paris');
        }

        if (
            'settings.modules' === $category &&
            $this->authorizationChecker->isGranted('ROLE_SUPER_ADMIN')
        ) {
            $toggles['disconnect_openid'] = $this->manager->isActive('disconnect_openid');
            $toggles['login_franceconnect'] = $this->manager->isActive('login_franceconnect');
        }

        return $toggles;
    }

    public function findCategoryForToggle(string $toggle): ?string
    {
        foreach (self::$categories as $name => $category) {
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
                0 === strrpos($name, 'pages.') &&
                $this->manager->hasOneActive($cat['conditions'])
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
                0 === strrpos($name, 'settings.') &&
                $this->manager->hasOneActive($cat['conditions'])
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
