<?php

namespace Capco\UserBundle\Manager;

use FOS\UserBundle\Model\UserInterface;

class UserManager
{
    protected $strategies;

    public function __construct($parisStrategy, $classicStrategory)
    {
        $this->strategies = [$parisStrategy, $classicStrategory];
    }

    public function createUser(): UserInterface
    {
        foreach ($this->strategies as $strategy) {
            if ($strategy->isAvailable()) {
                return $strategy->confirmRegistration($user, $isAdmin);
            }
        }
    }

    public function confirmRegistration(UserInterface &$user, bool $isAdmin)
    {
        foreach ($this->strategies as $strategy) {
            if ($strategy->isAvailable()) {
                return $strategy->confirmRegistration($user, $isAdmin);
            }
        }
    }
}
