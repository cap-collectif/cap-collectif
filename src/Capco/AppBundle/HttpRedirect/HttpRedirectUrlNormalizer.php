<?php

namespace Capco\AppBundle\HttpRedirect;

use Capco\AppBundle\Entity\SiteSettings;
use Capco\AppBundle\Repository\SiteSettingsRepository;
use Symfony\Component\HttpFoundation\RequestStack;

class HttpRedirectUrlNormalizer
{
    public function __construct(
        private readonly SiteSettingsRepository $siteSettingsRepository,
        private readonly string $routerRequestContextHost,
        private readonly RequestStack $requestStack
    ) {
    }

    public function normalizeSourceUrl(string $sourceUrl): string
    {
        $sourceUrl = trim($sourceUrl);

        if ('' === $sourceUrl) {
            return $sourceUrl;
        }

        if (!preg_match('#^https?://#i', $sourceUrl)) {
            return '';
        }

        $parts = parse_url($sourceUrl);
        if (false === $parts || empty($parts['host'])) {
            return '';
        }
        $host = strtolower((string) $parts['host']);
        if (!\in_array($host, $this->getAllowedSourceHosts(), true)) {
            return '';
        }
        $path = $this->normalizePath($parts['path'] ?? '/');
        $query = isset($parts['query']) ? '?' . $this->normalizeQuery($parts['query']) : '';

        return $path . $query;
    }

    private function normalizePath(string $path): string
    {
        $segments = explode('/', $path);
        $normalizedSegments = array_map(
            fn (string $segment): string => $this->normalizeUrlComponent($segment, true),
            $segments
        );

        return implode('/', $normalizedSegments);
    }

    private function normalizeQuery(string $query): string
    {
        return implode(
            '&',
            array_map(
                function (string $part): string {
                    $pair = explode('=', $part, 2);
                    $key = $this->normalizeUrlComponent($pair[0], false);
                    if (1 === \count($pair)) {
                        return $key;
                    }

                    return $key . '=' . $this->normalizeUrlComponent($pair[1], false);
                },
                explode('&', $query)
            )
        );
    }

    private function normalizeUrlComponent(string $value, bool $isPathSegment): string
    {
        $normalized = '';
        $allowedAsciiPattern = $isPathSegment
            ? '/^[A-Za-z0-9\\-._~!$&\'()*+,;=:@]$/'
            : '/^[A-Za-z0-9\\-._~!$\'()*+,;=:@\/?]$/';

        $parts = preg_split('/(%[0-9A-Fa-f]{2})/', $value, -1, \PREG_SPLIT_DELIM_CAPTURE | \PREG_SPLIT_NO_EMPTY);
        if (false === $parts) {
            return $normalized;
        }

        foreach ($parts as $part) {
            if (preg_match('/^%[0-9A-Fa-f]{2}$/', $part)) {
                $normalized .= strtoupper($part);

                continue;
            }

            $chars = preg_split('//u', $part, -1, \PREG_SPLIT_NO_EMPTY);
            if (false === $chars) {
                continue;
            }

            foreach ($chars as $char) {
                if (1 === \strlen($char) && preg_match($allowedAsciiPattern, $char)) {
                    $normalized .= $char;
                } else {
                    $normalized .= rawurlencode($char);
                }
            }
        }

        return $normalized;
    }

    /**
     * @return string[]
     */
    private function getAllowedSourceHosts(): array
    {
        $siteSettings = $this->siteSettingsRepository->findSiteSetting() ?? new SiteSettings();

        $hosts = [
            strtolower($this->routerRequestContextHost),
            strtolower($siteSettings->getCapcoDomain()),
        ];
        $requestHost = $this->requestStack->getCurrentRequest()?->getHost();
        if (\is_string($requestHost) && '' !== trim($requestHost)) {
            $hosts[] = strtolower(trim($requestHost));
        }
        $customDomain = $siteSettings->getCustomDomain();
        if (\is_string($customDomain) && '' !== trim($customDomain)) {
            $hosts[] = strtolower(trim($customDomain));
        }

        return array_values(array_unique($hosts));
    }
}
