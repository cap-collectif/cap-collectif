<?php

namespace Capco\UserBundle\OpenID\ReferrerResolver;

class OccitanieReferrerResolver implements ReferrerInterface
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
