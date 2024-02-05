<?php

namespace Capco\UserBundle\OpenID;

use Capco\Capco\UserBundle\OpenID\ReferrerResolver\KeycloakReferrerResolver;
use Capco\UserBundle\OpenID\ReferrerResolver\DefaultReferrerResolver;
use Capco\UserBundle\OpenID\ReferrerResolver\GrandLyonReferrerResolver;
use Capco\UserBundle\OpenID\ReferrerResolver\OccitanieReferrerResolver;
use Capco\UserBundle\OpenID\ReferrerResolver\ReferrerInterface;

class OpenIDReferrerResolver
{
    private ReferrerInterface $refererResolver;

    public function __construct(string $instanceName)
    {
        switch ($instanceName) {
            case 'occitanie':
            case 'occitanie-dedicated':
                $this->refererResolver = new OccitanieReferrerResolver();

                break;

            case 'grand-lyon':
            case 'grand-lyon-preprod':
                $this->refererResolver = new GrandLyonReferrerResolver();

                break;

            case 'preprod':
                $this->refererResolver = new KeycloakReferrerResolver();

                break;

            default:
                str_starts_with($instanceName, 'qa-')
                    ? $this->refererResolver = new KeycloakReferrerResolver()
                    : $this->refererResolver = new DefaultReferrerResolver();
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

    public function getRefererResolver(): ReferrerInterface
    {
        return $this->refererResolver;
    }
}
