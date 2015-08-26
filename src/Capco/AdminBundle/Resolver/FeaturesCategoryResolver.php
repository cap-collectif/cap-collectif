<?php

namespace Capco\AdminBundle\Resolver;

use Capco\AppBundle\Toggle\Manager;

class FeaturesCategoryResolver
{
    protected static $categories = array(
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
        'pages.consultations' => [
            'conditions' => [],
            'features' => ['consultations_form', 'consultation_trash'],
        ],
        'pages.registration' => [
            'conditions' => ['registration'],
            'features' => ['user_type'],
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
        'settings.global' => [
            'conditions' => [],
            'features' => [],
        ],
        'settings.modules' => [
            'conditions' => [],
            'features' => ['blog', 'calendar', 'ideas', 'themes', 'registration', 'members_list', 'reporting', 'newsletter', 'share_buttons', 'login_facebook', 'login_gplus', 'login_twitter'],
        ],
        'settings.notifications' => [
            'conditions' => [],
            'features' => [],
        ],
        'settings.shield_mode' => [
            'conditions' => [],
            'features' => ['shield_mode'],
        ],
        'settings.appearance' => [
            'conditions' => [],
            'features' => [],
        ],
    );

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

        return $toggles;
    }

    public function findCategoryForToggle($toggle)
    {
        foreach (self::$categories as $name => $category) {
            if (in_array($toggle, $category['features'])) {
                return $name;
            }
        }

        return;
    }

    public function getEnabledPagesCategories()
    {
        $categories = [];
        foreach (self::$categories as $name => $cat) {
            if (strrpos($name, 'pages.') === 0 && $this->manager->hasOneActive($cat['conditions'])) {
                $categories[] = $name;
            }
        }

        return $categories;
    }

    public function getEnabledSettingsCategories()
    {
        $categories = [];
        foreach (self::$categories as $name => $cat) {
            if (strrpos($name, 'settings.') === 0 && $this->manager->hasOneActive($cat['conditions'])) {
                $categories[] = $name;
            }
        }

        return $categories;
    }

    public function getGroupNameForCategory($category)
    {
        if (strrpos($category, 'settings.') === 0) {
            return 'admin.group.parameters';
        }
        if (strrpos($category, 'pages.') === 0) {
            return 'admin.group.pages';
        }

        return;
    }
}
