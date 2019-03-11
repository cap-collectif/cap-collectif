<?php

namespace Capco\AppBundle\Toggle;

use Qandidate\Toggle\ContextFactory;
use Qandidate\Toggle\Toggle;
use Qandidate\Toggle\ToggleManager;

class Manager
{
    protected $toggleManager;

    protected static $toggles = [
        'blog',
        'calendar',
        'captcha',
        'consent_external_communication',
        'developer_documentation',
        'public_api',
        'login_facebook',
        'login_gplus',
        'login_saml',
        'login_paris',
        'privacy_policy',
        'members_list',
        'newsletter',
        'profiles',
        'projects_form',
        'project_trash',
        'search',
        'share_buttons',
        'shield_mode',
        'registration',
        'phone_confirmation',
        'reporting',
        'restrict_registration_via_email_domain',
        'themes',
        'export',
        'districts',
        'user_type',
        'votes_evolution',
        'server_side_rendering',
        'zipcode_at_register',
        'indexation',
        'login_openid',
        'consultation_plan',
        'display_map',
        'consent_internal_communication',
    ];

    protected $context;

    protected $knownValues = [];

    public function __construct(ToggleManager $toggleManager, ContextFactory $contextFactory)
    {
        $this->toggleManager = $toggleManager;
        $this->context = $contextFactory->createContext();
    }

    public function exists(string $name): bool
    {
        return \in_array($name, self::$toggles, true);
    }

    public function activate(string $name): void
    {
        $this->toggleManager->add($this->createToggle($name, Toggle::ALWAYS_ACTIVE));
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

        return $return;
    }

    public function deactivate(string $name): void
    {
        $this->toggleManager->add($this->createToggle($name, Toggle::INACTIVE));
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
