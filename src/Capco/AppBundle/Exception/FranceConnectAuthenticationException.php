<?php

namespace Capco\AppBundle\Exception;

use Symfony\Component\Security\Core\Exception\AccountStatusException;

class FranceConnectAuthenticationException extends AccountStatusException
{
    /**
     * {@inheritdoc}
     */
    public function getMessageKey(): string
    {
        return 'Authentication expired because your account information has changed.';
    }
}
