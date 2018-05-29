<?php

namespace Capco\UserBundle\Security\Core\User;

use FOS\UserBundle\Security\UserProvider as BaseUserProvider;

class UserEmailProvider extends BaseUserProvider
{
    protected function findUser($email)
    {
        return $this->userManager->findUserByEmail($email);
    }
}
