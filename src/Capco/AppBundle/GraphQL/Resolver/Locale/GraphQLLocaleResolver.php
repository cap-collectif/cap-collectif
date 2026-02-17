<?php

namespace Capco\AppBundle\GraphQL\Resolver\Locale;

use Capco\AppBundle\Repository\LocaleRepository;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\RequestStack;

class GraphQLLocaleResolver
{
    /**
     * @var array<string, string>
     */
    private array $validatedLocales = [];

    private ?string $cachedRequestLocale = null;

    public function __construct(
        private readonly LocaleRepository $localeRepository,
        private readonly RequestStack $requestStack
    ) {
    }

    public function resolve(mixed $args = null): string
    {
        $localeFromArgs = $this->extractLocaleFromArgs($args);
        if (null !== $localeFromArgs) {
            return $this->getValidLocale($localeFromArgs);
        }

        if (null !== $this->cachedRequestLocale) {
            return $this->cachedRequestLocale;
        }

        $request = $this->requestStack->getCurrentRequest();
        $requestLocale = $request instanceof Request ? $request->getLocale() : null;
        $this->cachedRequestLocale = $this->getValidLocale($requestLocale);

        return $this->cachedRequestLocale;
    }

    public function resolveFromRequest(?Request $request, mixed $args = null): string
    {
        $localeFromArgs = $this->extractLocaleFromArgs($args);
        if (null !== $localeFromArgs) {
            return $this->getValidLocale($localeFromArgs);
        }

        return $this->getValidLocale($request?->getLocale());
    }

    private function getValidLocale(?string $locale): string
    {
        $cacheKey = $locale ?? '__default';
        if (!isset($this->validatedLocales[$cacheKey])) {
            $this->validatedLocales[$cacheKey] = $this->localeRepository->getValidCode($locale);
        }

        return $this->validatedLocales[$cacheKey];
    }

    private function extractLocaleFromArgs(mixed $args): ?string
    {
        if (!\is_array($args)) {
            return null;
        }

        $locale = $args['locale'] ?? null;
        if (!\is_string($locale) || '' === $locale) {
            return null;
        }

        return $locale;
    }
}
