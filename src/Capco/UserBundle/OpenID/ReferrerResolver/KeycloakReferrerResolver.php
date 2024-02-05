<?php

namespace Capco\Capco\UserBundle\OpenID\ReferrerResolver;

use Capco\UserBundle\OpenID\ReferrerResolver\ReferrerInterface;

class KeycloakReferrerResolver implements ReferrerInterface
{
    public function getRefererForProfile(): string
    {
        return 'referrer';
    }

    public function getRefererForLogout(): string
    {
        return 'post_logout_redirect_uri';
    }
}
