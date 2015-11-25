<?php

namespace Capco\AppBundle\Toggle;

use Qandidate\Toggle\Toggle;
use Qandidate\Toggle\ToggleManager;
use Qandidate\Toggle\ContextFactory;

class Manager
{
    protected $toggleManager;

    protected $prefix;

    protected static $toggles = array(
        'blog',
        'calendar',
        'newsletter',
        'ideas',
        'themes',
        'registration',
        'login_facebook',
        'login_gplus',
        'login_twitter',
        'login_nous_citoyens',
        'shield_mode',
        'user_type',
        'members_list',
        'projects_form',
        'share_buttons',
        'idea_creation',
        'project_trash',
        'idea_trash',
        'reporting',
        'zipcode_at_register',
    );

    public function __construct(ToggleManager $toggleManager, ContextFactory $contextFactory, $prefix)
    {
        $this->toggleManager = $toggleManager;
        $this->context = $contextFactory->createContext();
        $this->prefix = $prefix;
    }

    protected function getPrefixedName($name)
    {
        if (null != $this->prefix && !(0 === strpos($name, $this->prefix))) {
            return $this->prefix.'__'.$name;
        }

        return $name;
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
        $return = array();

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
        return $this->toggleManager->active($this->getPrefixedName($name), $this->context);
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

    private function createToggle($name, $status, array $conditions = array())
    {
        $toggle = new Toggle($this->getPrefixedName($name), $conditions);

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
