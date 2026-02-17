<?php

namespace Capco\AppBundle\EventListener;

use Capco\AppBundle\Repository\LocaleRepository;
use Capco\AppBundle\Resolver\LocalizedPathResolver;
use Capco\AppBundle\Toggle\Manager;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;
use Symfony\Component\HttpFoundation\RedirectResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpKernel\Event\RequestEvent;
use Symfony\Component\HttpKernel\KernelEvents;

class LegacyTlCanonicalRedirectSubscriber implements EventSubscriberInterface
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
            KernelEvents::REQUEST => [['onKernelRequest', 16]],
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

        $queryLocale = $request->query->get('tl');
        if (!\is_string($queryLocale) || '' === $queryLocale) {
            return;
        }

        if ($this->isTechnicalRequest($request)) {
            return;
        }

        if ($this->isSonataAdminRequest($request)) {
            return;
        }

        $resolvedLocale = $this->localeRepository->getValidCode($queryLocale);
        $targetPath = $this->localizedPathResolver->getCanonicalPathForLocale(
            $request->getPathInfo(),
            $resolvedLocale
        );

        $targetQuery = $request->query->all();
        unset($targetQuery['tl']);

        $targetUri = $request->getBaseUrl() . $targetPath;
        $queryString = http_build_query($targetQuery);
        if ('' !== $queryString) {
            $targetUri .= '?' . $queryString;
        }

        $currentUriWithoutTl = $request->getBaseUrl() . $request->getPathInfo();
        $currentQuery = $request->query->all();
        unset($currentQuery['tl']);
        $currentQueryString = http_build_query($currentQuery);
        if ('' !== $currentQueryString) {
            $currentUriWithoutTl .= '?' . $currentQueryString;
        }

        if ($targetUri === $currentUriWithoutTl) {
            return;
        }

        $event->setResponse(new RedirectResponse($targetUri));
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
