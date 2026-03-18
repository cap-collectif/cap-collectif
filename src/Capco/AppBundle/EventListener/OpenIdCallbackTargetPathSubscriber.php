<?php

namespace Capco\AppBundle\EventListener;

use Psr\Log\LoggerInterface;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpKernel\Event\RequestEvent;
use Symfony\Component\HttpKernel\KernelEvents;
use Symfony\Component\Security\Http\Util\TargetPathTrait;

class OpenIdCallbackTargetPathSubscriber implements EventSubscriberInterface
{
    use TargetPathTrait;

    private const LOG_PREFIX = '[openid-callback-target-path]';
    private const FIREWALL_NAME = 'main';
    private const OPENID_CALLBACK_PATH = '/login/check-openid';
    private const OPENID_REDIRECT_PATH = '/login/openid';
    private const LOGIN_PATH_PREFIX = '/login';
    private const OPENID_PROVIDER_PATH_FRAGMENT = '/protocol/openid-connect/';
    private const OPENID_PROVIDER_PATH_PREFIX = '/realms/';

    public function __construct(
        private readonly LoggerInterface $logger
    ) {
    }

    public static function getSubscribedEvents(): array
    {
        return [
            // Must run before the security firewall listener.
            KernelEvents::REQUEST => [['onKernelRequest', 16]],
        ];
    }

    public function onKernelRequest(RequestEvent $event): void
    {
        if (!$event->isMainRequest()) {
            return;
        }

        $request = $event->getRequest();
        if (Request::METHOD_GET !== $request->getMethod() || self::OPENID_CALLBACK_PATH !== $request->getPathInfo()) {
            return;
        }

        if (!$request->hasSession()) {
            $this->logger->debug(self::LOG_PREFIX . ' Skipping fallback: no session available.', [
                'path' => $request->getPathInfo(),
                'host' => $request->getHost(),
            ]);

            return;
        }

        $session = $request->getSession();
        if ($this->getTargetPath($session, self::FIREWALL_NAME)) {
            $this->logger->debug(self::LOG_PREFIX . ' Skipping fallback: target path already present.', [
                'firewall' => self::FIREWALL_NAME,
                'path' => $request->getPathInfo(),
            ]);

            return;
        }

        $targetPath = $this->resolveTargetPathFromReferer($request, $request->headers->get('referer'));
        if (!$targetPath) {
            $this->logger->debug(self::LOG_PREFIX . ' No safe target could be resolved from referer.', [
                'referer' => $request->headers->get('referer'),
                'host' => $request->getHost(),
                'scheme' => $request->getScheme(),
            ]);

            return;
        }

        $this->saveTargetPath($session, self::FIREWALL_NAME, $targetPath);
        $this->logger->info(self::LOG_PREFIX . ' Restored target path from referer.', [
            'targetPath' => $targetPath,
            'firewall' => self::FIREWALL_NAME,
        ]);
    }

    private function resolveTargetPathFromReferer(Request $request, ?string $referer): ?string
    {
        if (!$referer || !$this->isSameHostUrl($request, $referer)) {
            return null;
        }

        $path = parse_url($referer, \PHP_URL_PATH) ?: '/';
        if (self::OPENID_REDIRECT_PATH === $path) {
            $queryString = parse_url($referer, \PHP_URL_QUERY);
            if (!\is_string($queryString)) {
                $queryString = '';
            }
            parse_str($queryString, $query);

            $destination = $query['_destination'] ?? null;
            if (!\is_string($destination) || '' === $destination || !$this->isSameHostUrl($request, $destination)) {
                return null;
            }

            return $destination;
        }

        if (str_starts_with($path, self::LOGIN_PATH_PREFIX)) {
            return null;
        }

        if (
            str_starts_with($path, self::OPENID_PROVIDER_PATH_PREFIX)
            || str_contains($path, self::OPENID_PROVIDER_PATH_FRAGMENT)
        ) {
            return null;
        }

        return $referer;
    }

    private function isSameHostUrl(Request $request, string $url): bool
    {
        $parts = parse_url($url);
        if (!$parts || !isset($parts['host'], $parts['scheme'])) {
            return false;
        }

        return $parts['host'] === $request->getHost() && $parts['scheme'] === $request->getScheme();
    }
}
