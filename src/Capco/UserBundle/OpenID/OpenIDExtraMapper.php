<?php

namespace Capco\UserBundle\OpenID;

use Capco\UserBundle\Entity\User;
use Capco\UserBundle\OpenID\ExtraMapper\GrandLyonExtraMapper;
use Capco\UserBundle\OpenID\ExtraMapper\OccitanieExtraMapper;
use HWI\Bundle\OAuthBundle\OAuth\Response\UserResponseInterface;

class OpenIDExtraMapper
{
    private $extraMapper;

    public function __construct(string $instance)
    {
        switch ($instance) {
            case 'occitanie':
            case 'occitanie-preprod':
            case 'dev':
                $this->extraMapper = new OccitanieExtraMapper();

                break;
            case 'grand-lyon':
            case 'grand-lyon-preprod':
                $this->extraMapper = new GrandLyonExtraMapper();

                break;
            default:
                break;
        }
    }

    public function map(User $user, UserResponseInterface $response): void
    {
        if ($this->extraMapper) {
            $this->extraMapper->__invoke($user, $response);
        }
    }
}
