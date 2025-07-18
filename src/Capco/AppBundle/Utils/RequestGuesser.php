<?php

namespace Capco\AppBundle\Utils;

use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\RequestStack;

final class RequestGuesser implements RequestGuesserInterface
{
    public function __construct(private readonly RequestStack $requestStack)
    {
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

    /**
     * {@inheritdoc}
     */
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
