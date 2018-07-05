<?php
namespace Capco\UserBundle\Authenticator\Token;

use Symfony\Component\Security\Core\Authentication\Token\AbstractToken;

class ParisToken extends AbstractToken
{
    public function __construct($user, array $roles = [])
    {
        parent::__construct($roles);

        $this->setUser($user);

        if ($roles) {
            $this->setAuthenticated(true);
        }
    }

    public function getCredentials()
    {
        return null;
    }
}
