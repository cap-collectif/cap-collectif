<?php

namespace Capco\AppBundle\Utils;

use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\RequestStack;

/**
 * Please use this service every time you want to retrieve an IP or a User Agent.
 *
 * This service make sure we see the end-user IP addresses in origin requests with Cloudflare's True-Client-IP Header.
 * https://support.cloudflare.com/hc/en-us/articles/206776727-Understanding-the-True-Client-IP-Header
 *
 * In case we don't have this header, it fallback to the request IP.
 */
final class RequestGuesser
{
    private RequestStack $requestStack;

    public function __construct(RequestStack $requestStack)
    {
        $this->requestStack = $requestStack;
    }

    public function getClientIp(): ?string
    {
        $request = $this->getCurrentRequest();

        return $request ? self::getClientIpFromRequest($request) : null;
    }

    public function getUserAgent(): ?string
    {
        $request = $this->getCurrentRequest();

        return $request ? self::getUserAgentFromRequest($request) : null;
    }

    public function getJsonContent(): ?array
    {
        $request = $this->getCurrentRequest();
        if (null === $request) {
            return null;
        }
        $requestContent = $request->getContent();

        return null !== $requestContent ? json_decode($requestContent, true) : null;
    }

    /**
     * Use the static method when you have easy access to the request (eg: event listeners…).
     */
    public static function getClientIpFromRequest(Request $request): ?string
    {
        // Symfony normalized HTTP request headers with lowercase keys
        return $request->headers->get('true-client-ip') ??
            ($request->headers->get('cf-connecting-ip') ?? $request->getClientIp());
    }

    /**
     * Use the static method when you have easy access to the request (eg: event listeners…).
     */
    public static function getUserAgentFromRequest(Request $request): ?string
    {
        return $request->headers->get('User-Agent');
    }

    private function getCurrentRequest(): ?Request
    {
        return $this->requestStack->getCurrentRequest();
    }
}
