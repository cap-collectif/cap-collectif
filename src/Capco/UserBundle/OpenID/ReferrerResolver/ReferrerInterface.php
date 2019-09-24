<?php

namespace Capco\UserBundle\OpenID\ReferrerResolver;

interface ReferrerInterface
{
    public function getRefererForProfile(): string;

    public function getRefererForLogout(): string;
}
