<?php

namespace Capco\UserBundle\Authenticator\Token;

use Symfony\Component\Security\Core\Authentication\Token\AbstractToken;

/**
 * Class CASToken
 *
 */
class CASToken extends AbstractToken
{
    /**
     * @param $user
     * @param array $roles
     */
    public function __construct($user, array $roles = [])
    {
        parent::__construct($roles);

        $this->setUser($user);

        if ($roles) {
            $this->setAuthenticated(true);
        }
    }

    /**
     * @return null
     */
    public function getCredentials()
    {
        return null;
    }

}