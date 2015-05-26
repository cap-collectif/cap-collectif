<?php

namespace Capco\UserBundle\Security\Core\User;

use FOS\UserBundle\Security\UserProvider as BaseUserProvider;

/**
 * Class UserEmailProvider.
 */
class UserEmailProvider extends BaseUserProvider
{
    /**
     * {@inheritDoc}
     */
    protected function findUser($email)
    {
        return $this->userManager->findUserByEmail($email);
    }


}
