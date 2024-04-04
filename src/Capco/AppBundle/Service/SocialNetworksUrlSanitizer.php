<?php

namespace Capco\AppBundle\Service;

class SocialNetworksUrlSanitizer
{
    /**
     * @param array{'linkedInUrl'?: string, 'facebookUrl'?: string, 'twitterUrl'?: string, 'instagramUrl'?: string} $row
     *
     * @return array{'linkedInUrl'?: string, 'facebookUrl'?: string, 'twitterUrl'?: string, 'instagramUrl'?: string}
     */
    public function sanitize(array $row): array
    {
        $keyDomainsMapping = [
            'linkedInUrl' => ['linkedin.com'],
            'facebookUrl' => ['facebook.com'],
            'twitterUrl' => ['twitter.com', 'x.com'],
            'instagramUrl' => ['instagram.com'],
        ];

        foreach ($keyDomainsMapping as $key => $domains) {
            $value = $row[$key] ?? null;

            if (!$value) {
                continue;
            }

            foreach ($domains as $domain) {
                if (!str_contains($value, $domain)) {
                    continue;
                }

                $value = trim($value);
                $value = $this->replaceAccents($value);
                $value = $this->replaceTypos($value);
                $value = $this->replaceQueryParams($value);
                $urlPath = $this->getUrlPath($domain, $value);

                $sanitizedUrl = "https://{$domain}{$urlPath}";

                if ('' === $urlPath || '/' === $urlPath) {
                    $row[$key] = '';
                } else {
                    $row[$key] = $sanitizedUrl;
                }
            }
        }

        return $row;
    }

    private function replaceAccents(string $value): string
    {
        return \Transliterator::create('NFD; [:Nonspacing Mark:] Remove; NFC')
            ->transliterate($value) ?: ''
        ;
    }

    private function replaceTypos(string $value): string
    {
        $typoReplacements = [
            '.com//' => '.com/',
        ];

        foreach ($typoReplacements as $search => $replace) {
            $value = str_replace($search, $replace, $value);
        }

        return $value;
    }

    private function replaceQueryParams(string $value): string
    {
        $queryParamRegex = '/(.*)(\?.*$)/';

        return preg_replace($queryParamRegex, '$1', $value);
    }

    private function getUrlPath(string $domain, string $value): string
    {
        $path = explode($domain, $value);

        if ($path) {
            array_shift($path);

            return implode($domain, $path);
        }

        return '';
    }
}
