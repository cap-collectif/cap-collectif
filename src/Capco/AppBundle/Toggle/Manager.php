<?php

namespace Capco\AppBundle\Toggle;

use Qandidate\Toggle\Toggle;
use Qandidate\Toggle\ToggleManager;
use Qandidate\Toggle\ContextFactory;

class Manager
{
    protected $toggleManager;

    protected static $toggles = [
        'blog',
        'calendar',
        'ideas',
        'idea_creation',
        'idea_trash',
        'login_facebook',
        'login_gplus',
        'members_list',
        'newsletter',
        'projects_form',
        'project_trash',
        'share_buttons',
        'shield_mode',
        'registration',
        'sms_confirmation',
        'reporting',
        'themes',
        'districts',
        'user_type',
        'votes_evolution',
        'zipcode_at_register',
    ];

    public function __construct(ToggleManager $toggleManager, ContextFactory $contextFactory)
    {
        $this->toggleManager = $toggleManager;
        $this->context = $contextFactory->createContext();
    }

    public function activate($name)
    {
        $this->toggleManager->add($this->createToggle($name, Toggle::ALWAYS_ACTIVE));
    }

    public function activateAll()
    {
        foreach (self::$toggles as $name) {
            $this->activate($name);
        }
    }

    public function all($state = null)
    {
        // features are disabled by default
        $return = [];

        foreach (self::$toggles as $name) {
            if (null == $state || $state == $this->isActive($name)) {
                $return[$name] = $this->isActive($name);
            }
        }

        return $return;
    }

    public function deactivate($name)
    {
        $this->toggleManager->add($this->createToggle($name, Toggle::INACTIVE));
    }

    public function deactivateAll()
    {
        foreach (self::$toggles as $name) {
            $this->deactivate($name);
        }
    }

    public function isActive($name)
    {
        return $this->toggleManager->active($name, $this->context);
    }

    public function hasOneActive($names)
    {
        if (count($names) === 0) {
            return true;
        }

        foreach ($names as $name) {
            if ($this->isActive($name)) {
                return true;
            }
        }

        return false;
    }

    public function switchValue($name)
    {
        $value = $this->isActive($name);

        if ($value) {
            $this->deactivate($name);
        } else {
            $this->activate($name);
        }

        return !$value;
    }

    private function createToggle($name, $status, $conditions = [])
    {
        $toggle = new Toggle($name, $conditions);

        if ($status === Toggle::INACTIVE) {
            $toggle->deactivate();
        } else {
            $toggle->activate($status);
        }

        return $toggle;
    }

    /**
     * @param $features
     *
     * @return bool
     */
    public function containsEnabledFeature($features)
    {
        if (empty($features)) {
            return true;
        }

        foreach ($features as $feature) {
            if (in_array($feature, array_keys($this->all(true)))) {
                return true;
            }
        }

        return false;
    }
}
