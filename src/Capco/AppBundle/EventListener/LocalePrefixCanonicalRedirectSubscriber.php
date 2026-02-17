<?php

namespace Capco\AppBundle\EventListener;

use Capco\AppBundle\Repository\LocaleRepository;
use Capco\AppBundle\Resolver\LocalizedPathResolver;
use Capco\AppBundle\Router\DefaultPatternGenerationStrategy;
use Capco\AppBundle\Toggle\Manager;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;
use Symfony\Component\HttpFoundation\RedirectResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpKernel\Event\RequestEvent;
use Symfony\Component\HttpKernel\KernelEvents;

class LocalePrefixCanonicalRedirectSubscriber implements EventSubscriberInterface
{
    public function __construct(
        private readonly Manager $toggleManager,
        private readonly LocaleRepository $localeRepository,
        private readonly LocalizedPathResolver $localizedPathResolver
    ) {
    }

    public static function getSubscribedEvents(): array
    {
        return [
            KernelEvents::REQUEST => [['onKernelRequest', 17]],
        ];
    }

    public function onKernelRequest(RequestEvent $event): void
    {
        if (!$event->isMainRequest()) {
            return;
        }

        if (!$this->toggleManager->isActive(Manager::multilangue)) {
            return;
        }

        $request = $event->getRequest();
        if (!\in_array($request->getMethod(), [Request::METHOD_GET, Request::METHOD_HEAD], true)) {
            return;
        }

        if ($this->isTechnicalRequest($request)) {
            return;
        }

        if ($this->isSonataAdminRequest($request)) {
            return;
        }

        $pathInfo = $request->getPathInfo();
        if (!$this->isBarePrefixPath($pathInfo)) {
            return;
        }

        $prefix = ltrim($pathInfo, '/');
        $resolvedLocale = $this->resolveLocaleFromPrefix($prefix);
        if (null === $resolvedLocale) {
            return;
        }

        $request->setLocale($resolvedLocale);
        $request->attributes->set('_locale', $resolvedLocale);

        $targetPath = $this->localizedPathResolver->getCanonicalPathForLocale($pathInfo, $resolvedLocale);
        $targetUri = $request->getBaseUrl() . $targetPath;
        $queryString = (string) $request->server->get('QUERY_STRING', '');
        if ('' !== $queryString) {
            $targetUri .= '?' . $queryString;
        }

        $currentUri = $request->getBaseUrl() . $pathInfo;
        if ('' !== $queryString) {
            $currentUri .= '?' . $queryString;
        }

        if ($targetUri === $currentUri) {
            return;
        }

        $event->setResponse(new RedirectResponse($targetUri));
    }

    private function isBarePrefixPath(string $pathInfo): bool
    {
        if ('/' === $pathInfo || str_ends_with($pathInfo, '/')) {
            return false;
        }

        $trimmed = ltrim($pathInfo, '/');
        if ('' === $trimmed) {
            return false;
        }

        return !str_contains($trimmed, '/');
    }

    private function resolveLocaleFromPrefix(string $prefix): ?string
    {
        $normalizedPrefix = strtolower($prefix);
        foreach ($this->localeRepository->findPublishedLocales() as $locale) {
            $localeCode = $locale->getCode();
            if (DefaultPatternGenerationStrategy::getLocalePrefix($localeCode) === $normalizedPrefix) {
                return $localeCode;
            }
        }

        return null;
    }

    private function isSonataAdminRequest(Request $request): bool
    {
        $route = $request->attributes->get('_route');
        if (\is_string($route)) {
            if (str_starts_with($route, '_sonata') || str_starts_with($route, 'admin_') || str_starts_with($route, 'capco_admin')) {
                return true;
            }
        }

        $pathInfo = $request->getPathInfo();
        if (str_starts_with($pathInfo, '/admin')) {
            return true;
        }

        return $request->query->has('_sonata_admin') || $request->query->has('_sonata_name');
    }

    private function isTechnicalRequest(Request $request): bool
    {
        $pathInfo = $request->getPathInfo();
        foreach (['/api', '/graphql', '/graphiql', '/login', '/_wdt', '/_profiler'] as $excludedPrefix) {
            if (str_starts_with($pathInfo, $excludedPrefix)) {
                return true;
            }
        }

        $route = $request->attributes->get('_route');
        if (!\is_string($route)) {
            return false;
        }

        foreach (['capco_api_', 'capco_graph', 'hwi_', 'fos_user'] as $excludedRoutePrefix) {
            if (str_starts_with($route, $excludedRoutePrefix)) {
                return true;
            }
        }

        return \in_array(
            $route,
            ['facebook_login', 'google_login', 'openid_login', 'franceconnect_login'],
            true
        );
    }
}
