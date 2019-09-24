<?php

namespace Capco\UserBundle\OpenID;

use Capco\UserBundle\OpenID\Mapping\GrandLyonMapping;
use Capco\UserBundle\OpenID\ReferrerResolver\DefaultReferrerResolver;
use Capco\UserBundle\OpenID\ReferrerResolver\OccitanieReferrerResolver;

class OpenIDReferrerResolver
{
    private $refererResolver;

    public function __construct(string $instance)
    {
        switch ($instance) {
            case 'occitanie':
                $this->refererResolver = new OccitanieReferrerResolver();

                break;
            case 'grand-lyon':
            case 'grand-lyon-preprod':
                $this->refererResolver = new GrandLyonMapping();

                break;
            default:
                $this->refererResolver = new DefaultReferrerResolver();
        }
    }

    public function getRefererParameterForProfile(): string
    {
        return $this->refererResolver->getRefererForProfile();
    }

    public function getRefererParameterForLogout(): string
    {
        return $this->refererResolver->getRefererForLogout();
    }
}
