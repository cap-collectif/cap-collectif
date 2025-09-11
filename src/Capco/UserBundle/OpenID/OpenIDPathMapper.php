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
use Capco\UserBundle\OpenID\Mapping\NimesMapping;
use Capco\UserBundle\OpenID\Mapping\OccitanieMapping;
use Capco\UserBundle\OpenID\Mapping\ParisMapping;

class OpenIDPathMapper
{
    private readonly MappingInterface $instanceMapper;

    public function __construct(string $instance)
    {
        $this->instanceMapper = match ($instance) {
            'parlons-energies', 'pe' => new EdfMapping(),
            'occitanie', 'occitanie-dedicated', 'occitanie-preprod' => new OccitanieMapping(),
            'nantes' => new NantesMapping(),
            'decathlon-preprod', 'nl-decathlon', 'decathlon' => new DecathlonMapping(),
            'grand-lyon', 'grand-lyon-preprod' => new GrandLyonMapping(),
            'carpentras' => new CarpentrasMapping(),
            'paris-dedicated' => new ParisMapping(),
            'aix-marseille-univ' => new AixMarseilleUnivMapping(),
            'debatpenly', 'debateauidf', 'debatdsf', 'participer-debat-lithium',
            'participer-debat-gravelines', 'participer-debat-fessenheim',
            'participer-debat-bugey', 'participer-debat-fos', 'rte-cndp', 'pngmdr' => new CndpMapping(),
            'dijon' => new DijonMapping(),
            'nimes', 'nimes-metropole' => new NimesMapping(),
            default => new DevOpenIDMapping(),
        };
    }

    public function getOpenIDMapping(): array
    {
        return $this->instanceMapper->getPaths();
    }
}
