<?php

namespace Capco\AppBundle\Resolver;

use Capco\AppBundle\Entity\Locale;
use Capco\AppBundle\Repository\LocaleRepository;
use Capco\AppBundle\Router\DefaultPatternGenerationStrategy;
use Capco\AppBundle\Toggle\Manager;
use Negotiation\LanguageNegotiator;
use Symfony\Component\HttpFoundation\Request;

class RequestLocaleResolver
{
    public function __construct(
        private readonly LocaleRepository $localeRepository,
        private readonly Manager $toggleManager
    ) {
    }

    public function resolve(Request $request): string
    {
        if (!$this->toggleManager->isActive(Manager::multilangue)) {
            return $this->localeRepository->getValidCode();
        }

        $routeLocale = $request->attributes->get('_locale');
        if (\is_string($routeLocale) && '' !== $routeLocale) {
            return $this->localeRepository->getValidCode($routeLocale);
        }

        $pathPrefixLocale = $this->resolvePathPrefixLocale($request);
        if (null !== $pathPrefixLocale) {
            return $pathPrefixLocale;
        }

        $cookieLocale = $request->cookies->get('locale');
        if (
            \is_string($cookieLocale)
            && '' !== $cookieLocale
            && $this->localeRepository->isCodePublished($cookieLocale)
        ) {
            return $cookieLocale;
        }

        $sessionLocale = $this->getSessionLocale($request);
        if (null !== $sessionLocale) {
            return $sessionLocale;
        }

        $acceptLanguageLocale = $this->resolveAcceptLanguageLocale($request);
        if (null !== $acceptLanguageLocale) {
            return $acceptLanguageLocale;
        }

        return $this->localeRepository->getValidCode($request->getLocale() ?: null);
    }

    private function getSessionLocale(Request $request): ?string
    {
        if (!$request->hasSession()) {
            return null;
        }

        $locale = $request->getSession()->get('_locale');
        if (!\is_string($locale) || '' === $locale) {
            return null;
        }

        return $this->localeRepository->isCodePublished($locale) ? $locale : null;
    }

    private function resolveAcceptLanguageLocale(Request $request): ?string
    {
        $acceptLanguages = $request->headers->get('Accept-Language');
        if (!\is_string($acceptLanguages) || '' === $acceptLanguages) {
            return null;
        }

        $availableLocales = array_map(
            static fn (Locale $locale): string => $locale->getCode(),
            $this->localeRepository->findPublishedLocales()
        );
        if ([] === $availableLocales) {
            return null;
        }

        $bestLanguage = (new LanguageNegotiator())->getBest($acceptLanguages, $availableLocales);

        return $bestLanguage ? $bestLanguage->getValue() : null;
    }

    private function resolvePathPrefixLocale(Request $request): ?string
    {
        $pathInfo = $request->getPathInfo();
        if (!\is_string($pathInfo) || '' === $pathInfo || '/' === $pathInfo) {
            return null;
        }

        $firstSegment = explode('/', ltrim($pathInfo, '/'))[0] ?? null;
        if (!\is_string($firstSegment) || '' === $firstSegment) {
            return null;
        }

        $normalizedPrefix = strtolower($firstSegment);
        foreach ($this->localeRepository->findPublishedLocales() as $locale) {
            $localeCode = $locale->getCode();
            if (DefaultPatternGenerationStrategy::getLocalePrefix($localeCode) === $normalizedPrefix) {
                return $localeCode;
            }
        }

        return null;
    }
}
