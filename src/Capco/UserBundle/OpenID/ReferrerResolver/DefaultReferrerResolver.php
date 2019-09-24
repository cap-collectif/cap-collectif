<?php

namespace Capco\UserBundle\OpenID\ReferrerResolver;

class DefaultReferrerResolver implements ReferrerInterface
{
    public function getRefererForProfile(): string
    {
        return 'referrer';
    }

    public function getRefererForLogout(): string
    {
        return 'redirect_uri';
    }
}
