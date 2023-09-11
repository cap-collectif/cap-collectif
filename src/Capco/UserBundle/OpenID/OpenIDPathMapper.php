<?php

namespace Capco\UserBundle\OpenID;

use Capco\UserBundle\OpenID\Mapping\AixMarseilleUnivMapping;
use Capco\UserBundle\OpenID\Mapping\CarpentrasMapping;
use Capco\UserBundle\OpenID\Mapping\CndpMapping;
use Capco\UserBundle\OpenID\Mapping\DecathlonMapping;
use Capco\UserBundle\OpenID\Mapping\DevOpenIDMapping;
use Capco\UserBundle\OpenID\Mapping\DijonMapping;
use Capco\UserBundle\OpenID\Mapping\EdfMapping;
use Capco\UserBundle\OpenID\Mapping\GrandLyonMapping;
use Capco\UserBundle\OpenID\Mapping\MappingInterface;
use Capco\UserBundle\OpenID\Mapping\NantesMapping;
use Capco\UserBundle\OpenID\Mapping\OccitanieMapping;
use Capco\UserBundle\OpenID\Mapping\ParisMapping;

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

            case 'paris-dedicated':
                $this->instanceMapper = new ParisMapping();

                break;

            case 'aix-marseille-univ':
                $this->instanceMapper = new AixMarseilleUnivMapping();

                break;

            case 'debatpenly':
            case 'debateauidf':
                $this->instanceMapper = new CndpMapping();

                break;

            case 'dijon':
                $this->instanceMapper = new DijonMapping();

                break;

            case 'dev':
            default:
                $this->instanceMapper = new DevOpenIDMapping();
        }
    }

    public function getOpenIDMapping(): array
    {
        return $this->instanceMapper->getPaths();
    }
}
