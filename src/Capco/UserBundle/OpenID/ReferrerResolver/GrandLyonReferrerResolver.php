<?php

namespace Capco\UserBundle\OpenID\ReferrerResolver;

class GrandLyonReferrerResolver implements ReferrerInterface
{
    public function getRefererForProfile(): string
    {
        return 'next';
    }

    public function getRefererForLogout(): string
    {
        return 'next';
    }
}
