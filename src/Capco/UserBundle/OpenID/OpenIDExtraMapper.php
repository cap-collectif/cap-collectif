<?php

namespace Capco\UserBundle\OpenID;

use Capco\UserBundle\Entity\User;
use Capco\UserBundle\OpenID\ExtraMapper\GrandLyonExtraMapper;
use Capco\UserBundle\OpenID\ExtraMapper\OccitanieExtraMapper;
use HWI\Bundle\OAuthBundle\OAuth\Response\UserResponseInterface;
use Psr\Log\LoggerInterface;

class OpenIDExtraMapper
{
    private $extraMapper;
    private readonly LoggerInterface $logger;

    public function __construct(string $instanceName, LoggerInterface $logger)
    {
        $this->logger = $logger;

        switch ($instanceName) {
            case 'occitanie':
            case 'occitanie-dedicated':
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
            $this->extraMapper->__invoke($user, $response, $this->logger);
        }
    }
}
