<?php

namespace Capco\AdminBundle\Resolver;

use Capco\AppBundle\Helper\EnvHelper;
use Capco\AppBundle\Toggle\Manager;

class FeaturesCategoryResolver
{
    protected static $categories = [
        'pages.homepage' => [
            'conditions' => [],
            'features' => [],
        ],
        'pages.blog' => [
            'conditions' => ['blog'],
            'features' => [],
        ],
        'pages.events' => [
            'conditions' => ['calendar'],
            'features' => [],
        ],
        'pages.ideas' => [
            'conditions' => ['ideas'],
            'features' => ['idea_creation'],
        ],
        'pages.ideas_trash' => [
            'conditions' => ['ideas'],
            'features' => ['idea_trash'],
        ],
        'pages.themes' => [
            'conditions' => ['themes'],
            'features' => [],
        ],
        'pages.projects' => [
            'conditions' => [],
            'features' => ['projects_form', 'project_trash'],
        ],
        'pages.registration' => [
            'conditions' => [],
            'features' => ['user_type', 'zipcode_at_register'],
        ],
        'pages.members' => [
            'conditions' => ['members_list'],
            'features' => [],
        ],
        'pages.login' => [
            'conditions' => [],
            'features' => [],
        ],
        'pages.contact' => [
            'conditions' => [],
            'features' => [],
        ],
        'pages.footer' => [
            'conditions' => [],
            'features' => [],
        ],
        'pages.shield' => [
            'conditions' => [],
            'features' => ['shield_mode'],
        ],
        'settings.global' => [
            'conditions' => [],
            'features' => [],
        ],
        'settings.modules' => [
            'conditions' => [],
            'features' => ['blog', 'calendar', 'ideas', 'versions', 'themes', 'districts', 'members_list', 'profiles', 'reporting', 'newsletter', 'share_buttons', 'search', 'votes_evolution', 'phone_confirmation', 'server_side_rendering', 'export'],
        ],
        'settings.notifications' => [
            'conditions' => [],
            'features' => [],
        ],
        'settings.appearance' => [
            'conditions' => [],
            'features' => [],
        ],
    ];

    protected $manager;

    public function __construct(Manager $manager)
    {
        $this->manager = $manager;
    }

    public function isCategoryEnabled($category)
    {
        if (!array_key_exists($category, self::$categories)) {
            return false;
        }

        return $this->manager->hasOneActive(self::$categories[$category]['conditions']);
    }

    public function isAdminEnabled($admin)
    {
        if (method_exists($admin, 'getFeatures')) {
            return $this->manager->hasOneActive($admin->getFeatures());
        }

        return true;
    }

    public function getTogglesByCategory($category)
    {
        $toggles = [];
        if (array_key_exists($category, self::$categories)) {
            foreach (self::$categories[$category]['features'] as $feature) {
                $toggles[$feature] = $this->manager->isActive($feature);
            }
        }

        if ('settings.modules' === $category && EnvHelper::get('SYMFONY_LOGIN_SAML_ALLOWED')) {
            $toggles['login_saml'] = $this->manager->isActive('login_saml');
        }

        if ('settings.modules' === $category && EnvHelper::get('SYMFONY_LOGIN_PARIS_ALLOWED')) {
            $toggles['login_paris'] = $this->manager->isActive('login_paris');
        }

        return $toggles;
    }

    public function findCategoryForToggle($toggle)
    {
        foreach (self::$categories as $name => $category) {
            if (in_array($toggle, $category['features'], true)) {
                return $name;
            }
        }
    }

    public function getEnabledPagesCategories()
    {
        $categories = [];
        foreach (self::$categories as $name => $cat) {
            if (0 === strrpos($name, 'pages.') && $this->manager->hasOneActive($cat['conditions'])) {
                $categories[] = $name;
            }
        }

        return $categories;
    }

    public function getEnabledSettingsCategories()
    {
        $categories = [];
        foreach (self::$categories as $name => $cat) {
            if (0 === strrpos($name, 'settings.') && $this->manager->hasOneActive($cat['conditions'])) {
                $categories[] = $name;
            }
        }

        return $categories;
    }

    public function getGroupNameForCategory($category)
    {
        if (0 === strrpos($category, 'settings.')) {
            return 'admin.group.parameters';
        }
        if (0 === strrpos($category, 'pages.')) {
            return 'admin.group.pages';
        }
    }
}
