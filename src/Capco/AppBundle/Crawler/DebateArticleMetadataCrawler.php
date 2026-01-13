<?php

namespace Capco\AppBundle\Crawler;

use Capco\AppBundle\Entity\Debate\DebateArticle;
use Symfony\Component\DomCrawler\UriResolver;
use Symfony\Contracts\HttpClient\HttpClientInterface;

class DebateArticleMetadataCrawler
{
    private const REQUEST_TIMEOUT = 10.0;
    private const MAX_REDIRECTS = 5;
    private const USER_AGENT = 'CapcoMetadataCrawler/1.0';

    public function __construct(private readonly HttpClientInterface $httpClient)
    {
    }

    public function completeArticle(DebateArticle $debateArticle): DebateArticle
    {
        $url = $debateArticle->getUrl();
        if (null === $url || '' === trim($url)) {
            throw new \RuntimeException(message: 'no url in debateArticle');
        }
        $metadata = $this->call(url: $url);
        $error = $metadata['error'] ?? null;
        if (null !== $error) {
            throw new \RuntimeException(message: 'crawler error : ' . $error);
        }

        return self::applyDataOnArticle(
            debateArticle: $debateArticle,
            metadata: $metadata
        );
    }

    /**
     * @return array<string, mixed>
     */
    public function call(string $url): array
    {
        $attempts = $this->buildUrlAttempts(url: $url);
        $lastError = null;
        foreach ($attempts as $attemptUrl) {
            $result = $this->fetchMetadata(url: $attemptUrl);
            if (!isset($result['error'])) {
                return $result;
            }
            $lastError = $result['error'];
        }

        return ['error' => $lastError ?? 'Unable to fetch metadata'];
    }

    /**
     * @param array<string, mixed> $metadata
     */
    private static function applyDataOnArticle(DebateArticle $debateArticle, array $metadata): DebateArticle
    {
        if (isset($metadata['title'])) {
            $debateArticle->setTitle(title: $metadata['title']);
        }
        if (isset($metadata['name'])) {
            $debateArticle->setOrigin(origin: $metadata['name']);
        }
        if (isset($metadata['description'])) {
            $debateArticle->setDescription(description: $metadata['description']);
        }
        if (isset($metadata['image'])) {
            $debateArticle->setCoverUrl(coverUrl: $metadata['image']);
        }
        if (isset($metadata['crawledAt'])) {
            $crawledAt = self::parseDateValue(value: $metadata['crawledAt']);
            if (null !== $crawledAt) {
                $debateArticle->setCrawledAt(crawledAt: $crawledAt);
            }
        }
        if (isset($metadata['publishedAt'])) {
            $publishedAt = self::parseDateValue(value: $metadata['publishedAt']);
            if (null !== $publishedAt) {
                $debateArticle->setPublishedAt(publishedAt: $publishedAt);
            }
        }

        return $debateArticle;
    }

    /**
     * @return array<string>
     */
    private function buildUrlAttempts(string $url): array
    {
        $normalized = $this->normalizeUrl(url: $url);
        $attempts = [$normalized];
        if ($normalized !== $url && str_starts_with($normalized, 'https://')) {
            $attempts[] = 'http://' . substr($normalized, 8);
        }

        return array_values(array_unique($attempts));
    }

    private function normalizeUrl(string $url): string
    {
        $trimmed = trim($url);
        if ('' === $trimmed) {
            return $trimmed;
        }
        if (!preg_match('#^https?://#i', $trimmed)) {
            return 'https://' . ltrim($trimmed, '/');
        }

        return $trimmed;
    }

    /**
     * @return array<string, mixed>
     */
    private function fetchMetadata(string $url): array
    {
        try {
            $response = $this->httpClient->request(
                method: 'GET',
                url: $url,
                options: [
                    'headers' => [
                        'User-Agent' => self::USER_AGENT,
                        'Accept' => 'text/html,application/xhtml+xml',
                    ],
                    'max_redirects' => self::MAX_REDIRECTS,
                    'timeout' => self::REQUEST_TIMEOUT,
                ]
            );

            $statusCode = $response->getStatusCode();
            $content = $response->getContent(false);
            if ($statusCode < 200 || $statusCode >= 300) {
                return ['error' => sprintf('HTTP %d when fetching %s', $statusCode, $url)];
            }
            if ('' === trim($content)) {
                return ['error' => 'Empty response body'];
            }
        } catch (\Throwable $exception) {
            return ['error' => $exception->getMessage()];
        }

        $metadata = $this->extractMetadata(html: $content, baseUrl: $url);
        $metadata['crawledAt'] = new \DateTimeImmutable();

        return $metadata;
    }

    /**
     * @return array<string, mixed>
     */
    private function extractMetadata(string $html, string $baseUrl): array
    {
        $parsed = $this->parseMetaTags(html: $html);
        $metaByName = $parsed['name'];
        $metaByProperty = $parsed['property'];

        $title = $metaByProperty['og:title']
            ?? $metaByName['twitter:title']
            ?? $metaByName['title']
            ?? $parsed['title'];
        $description = $metaByProperty['og:description']
            ?? $metaByName['twitter:description']
            ?? $metaByName['description']
            ?? null;
        $image = $metaByProperty['og:image']
            ?? $metaByName['twitter:image']
            ?? $metaByName['image']
            ?? null;
        if (null !== $image) {
            $image = $this->resolveUrl(baseUrl: $baseUrl, maybeRelative: $image);
        }

        $origin = $metaByProperty['og:site_name']
            ?? $metaByName['application-name']
            ?? $metaByName['author']
            ?? $this->extractHost(url: $baseUrl);

        $publishedAtRaw = $metaByProperty['article:published_time']
            ?? $metaByName['pubdate']
            ?? $metaByName['publishdate']
            ?? $metaByName['timestamp']
            ?? null;
        $publishedAt = self::parseDateValue(value: $publishedAtRaw);

        $metadata = [];
        if (null !== $title && '' !== $title) {
            $metadata['title'] = $title;
        }
        if (null !== $origin && '' !== $origin) {
            $metadata['name'] = $origin;
        }
        if (null !== $description && '' !== $description) {
            $metadata['description'] = $description;
        }
        if (null !== $image && '' !== $image) {
            $metadata['image'] = $image;
        }
        if (null !== $publishedAt) {
            $metadata['publishedAt'] = $publishedAt;
        }

        return $metadata;
    }

    /**
     * @return array{name: array<string, string>, property: array<string, string>, title: ?string}
     */
    private function parseMetaTags(string $html): array
    {
        $document = new \DOMDocument('1.0', 'UTF-8');
        $previous = libxml_use_internal_errors(true);
        $document->loadHTML($html, \LIBXML_NONET | \LIBXML_NOWARNING | \LIBXML_NOERROR);
        libxml_clear_errors();
        libxml_use_internal_errors($previous);

        $xpath = new \DOMXPath($document);
        $metaNodes = $xpath->query('//meta[@content]');
        $metaByName = [];
        $metaByProperty = [];
        if ($metaNodes) {
            foreach ($metaNodes as $metaNode) {
                $content = trim($metaNode->getAttribute('content'));
                if ('' === $content) {
                    continue;
                }
                $name = strtolower(trim($metaNode->getAttribute('name')));
                if ('' !== $name) {
                    $metaByName[$name] = $content;
                }
                $property = strtolower(trim($metaNode->getAttribute('property')));
                if ('' !== $property) {
                    $metaByProperty[$property] = $content;
                }
            }
        }

        $title = null;
        $titleNodes = $xpath->query('//title');
        if ($titleNodes && $titleNodes->length > 0) {
            $title = trim((string) $titleNodes->item(0)->textContent);
            if ('' === $title) {
                $title = null;
            }
        }

        return [
            'name' => $metaByName,
            'property' => $metaByProperty,
            'title' => $title,
        ];
    }

    private function resolveUrl(string $baseUrl, string $maybeRelative): string
    {
        if (str_starts_with($maybeRelative, 'data:')) {
            return $maybeRelative;
        }

        return UriResolver::resolve(uri: $maybeRelative, baseUri: $baseUrl);
    }

    private function extractHost(string $url): ?string
    {
        $host = parse_url($url, \PHP_URL_HOST);
        if (\is_string($host) && '' !== $host) {
            return $host;
        }

        return null;
    }

    private static function parseDateValue(mixed $value): ?\DateTimeInterface
    {
        if ($value instanceof \DateTimeInterface) {
            return $value;
        }
        if (\is_array($value) && isset($value['date']) && \is_string($value['date'])) {
            $value = $value['date'];
        }
        if (\is_string($value) && '' !== $value) {
            try {
                return new \DateTimeImmutable(datetime: $value);
            } catch (\Exception) {
                return null;
            }
        }

        return null;
    }
}
