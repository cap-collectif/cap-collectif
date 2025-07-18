<?php

namespace Capco\AppBundle\Utils;

use Symfony\Component\HttpFoundation\Request;

/**
 * Please use this service every time you want to retrieve an IP or a User Agent.
 *
 * This service make sure we see the end-user IP addresses in origin requests with Cloudflare's True-Client-IP Header.
 * https://support.cloudflare.com/hc/en-us/articles/206776727-Understanding-the-True-Client-IP-Header
 *
 * In case we don't have this header, it fallback to the request IP.
 */
interface RequestGuesserInterface
{
    public function getClientIp(): ?string;

    public function getUserAgent(): ?string;

    /**
     * @return null|array<string, mixed>
     */
    public function getJsonContent(): ?array;
}
