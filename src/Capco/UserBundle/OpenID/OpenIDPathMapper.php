<?php

namespace Capco\UserBundle\OpenID;

use Capco\UserBundle\OpenID\Mapping\DecathlonMapping;
use Capco\UserBundle\OpenID\Mapping\DevOpenIDMapping;
use Capco\UserBundle\OpenID\Mapping\NantesMapping;
use Capco\UserBundle\OpenID\Mapping\OccitanieMapping;

class OpenIDPathMapper
{
    private $instanceMapper;

    public function __construct(string $instance)
    {
        switch ($instance) {
            case 'occitanie':
                $this->instanceMapper = new OccitanieMapping();

                break;
            case 'nantes':
                $this->instanceMapper = new NantesMapping();

                break;
            case 'dev':
                $this->instanceMapper = new DevOpenIDMapping();

                break;
            case 'decathlon-preprod':
            case 'decathlon':
                $this->instanceMapper = new DecathlonMapping();

                break;
            default:
                throw new \RuntimeException('No mapping found for provider: ' . $instance);
        }
    }

    public function getOpenIDMapping(): array
    {
        return $this->instanceMapper->getPaths();
    }
}
