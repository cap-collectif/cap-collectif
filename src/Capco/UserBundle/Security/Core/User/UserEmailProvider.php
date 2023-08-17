<?php

namespace Capco\UserBundle\Security\Core\User;

use FOS\UserBundle\Model\UserInterface;
use FOS\UserBundle\Security\UserProvider as BaseUserProvider;

class UserEmailProvider extends BaseUserProvider
{
    public function findUser($email): ?UserInterface
    {
        return $this->userManager->findUserByEmail($email);
    }
}
