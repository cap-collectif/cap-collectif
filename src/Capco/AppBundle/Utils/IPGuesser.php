<?php

namespace Capco\AppBundle\Utils;

use Symfony\Component\HttpFoundation\Request;

final class IPGuesser
{
    public static function getClientIp(Request $request): string
    {
        // https://support.cloudflare.com/hc/en-us/articles/206776727-Understanding-the-True-Client-IP-Header
        return $_SERVER['HTTP_TRUE_CLIENT_IP'] ?? $request->getClientIp();
    }
}
