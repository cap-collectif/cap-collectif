<?php

namespace Capco\AppBundle\Resolver;

use Capco\AppBundle\Entity\Locale;
use Capco\AppBundle\Repository\LocaleRepository;
use Capco\AppBundle\Router\DefaultPatternGenerationStrategy;

class LocalizedPathResolver
{
    public function __construct(
        private readonly LocaleResolver $localeResolver,
        private readonly LocaleRepository $localeRepository
    ) {
    }

    public function getCanonicalPathForLocale(string $path, string $localeCode): string
    {
        $normalizedPath = self::normalizePath($path);
        $basePath = $this->stripLocalePrefix($normalizedPath);
        $defaultLocale = $this->localeResolver->getDefaultLocaleCode();

        if ($localeCode === $defaultLocale) {
            return $basePath;
        }

        $prefix = DefaultPatternGenerationStrategy::getLocalePrefix($localeCode);

        if ('/' === $basePath) {
            return '/' . $prefix . '/';
        }

        return '/' . $prefix . $basePath;
    }

    public function stripLocalePrefix(string $path): string
    {
        $normalizedPath = self::normalizePath($path);
        $parts = array_values(array_filter(
            explode('/', $normalizedPath),
            static fn (string $value): bool => '' !== $value
        ));

        if (isset($parts[0]) && \in_array($parts[0], $this->getPublishedLocalePrefixes(), true)) {
            array_shift($parts);
        }

        if ([] === $parts) {
            return '/';
        }

        return '/' . implode('/', $parts);
    }

    /**
     * @return string[]
     */
    private function getPublishedLocalePrefixes(): array
    {
        $prefixes = array_map(
            static fn (Locale $locale): string => DefaultPatternGenerationStrategy::getLocalePrefix($locale->getCode()),
            $this->localeRepository->findPublishedLocales()
        );

        return array_values(array_unique($prefixes));
    }

    private static function normalizePath(string $path): string
    {
        if ('' === $path) {
            return '/';
        }

        if ('/' !== $path[0]) {
            return '/' . ltrim($path, '/');
        }

        return $path;
    }
}
