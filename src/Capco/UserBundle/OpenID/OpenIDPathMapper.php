<?php

namespace Capco\UserBundle\OpenID;

use Capco\UserBundle\OpenID\Mapping\CarpentrasMapping;
use Capco\UserBundle\OpenID\Mapping\DecathlonMapping;
use Capco\UserBundle\OpenID\Mapping\DevOpenIDMapping;
use Capco\UserBundle\OpenID\Mapping\EdfMapping;
use Capco\UserBundle\OpenID\Mapping\GrandLyonMapping;
use Capco\UserBundle\OpenID\Mapping\MappingInterface;
use Capco\UserBundle\OpenID\Mapping\NantesMapping;
use Capco\UserBundle\OpenID\Mapping\OccitanieMapping;

class OpenIDPathMapper
{
    private MappingInterface $instanceMapper;

    public function __construct(string $instance)
    {
        switch ($instance) {
            case 'parlons-energies':
            case 'pe':
                $this->instanceMapper = new EdfMapping();

                break;
            case 'occitanie':
            case 'occitanie-dedicated':
                $this->instanceMapper = new OccitanieMapping();

                break;
            case 'nantes':
                $this->instanceMapper = new NantesMapping();

                break;
            case 'dev':
                $this->instanceMapper = new DevOpenIDMapping();

                break;
            case 'decathlon-preprod':
            case 'nl-decathlon':
            case 'decathlon':
                $this->instanceMapper = new DecathlonMapping();

                break;
            case 'grand-lyon':
            case 'grand-lyon-preprod':
                $this->instanceMapper = new GrandLyonMapping();

                break;
            case 'carpentras':
                $this->instanceMapper = new CarpentrasMapping();

                break;
            default:
                $this->instanceMapper = new DevOpenIDMapping();
        }
    }

    public function getOpenIDMapping(): array
    {
        return $this->instanceMapper->getPaths();
    }
}
