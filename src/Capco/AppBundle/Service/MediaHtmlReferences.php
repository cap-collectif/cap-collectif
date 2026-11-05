<?php

namespace Capco\AppBundle\Service;

use Capco\AppBundle\Entity\Media;
use Capco\AppBundle\Repository\MediaRepository;
use Symfony\Component\DependencyInjection\ParameterBag\ParameterBagInterface;

class MediaHtmlReferences
{
    public function __construct(private readonly MediaRepository $medias, private readonly ParameterBagInterface $parameters) {}

    /** @return list<Media> */
    public function references(string $html): array
    {
        if (!str_contains($html, '<')) {
            return [];
        }
        $document = new \DOMDocument();
        $previous = libxml_use_internal_errors(true);

        try {
            $document->loadHTML('<?xml encoding="UTF-8">' . $html, \LIBXML_NONET);
        } finally {
            libxml_clear_errors();
            libxml_use_internal_errors($previous);
        }
        $found = [];
        foreach ((new \DOMXPath($document))->query('//@src | //@href | //@srcset | //@poster') as $attribute) {
            $urls = 'srcset' === $attribute->nodeName ? preg_split('~[\s,]+~', $attribute->nodeValue) : [$attribute->nodeValue];
            foreach ($urls as $url) {
                foreach ($this->resolve($url) as $media) {
                    $found[$media->getId()] = $media;
                }
            }
        }

        return array_values($found);
    }

    public function replace(string $html, Media $original, string $newReference): string
    {
        return $this->map($html, function (string $url) use ($original, $newReference): string {
            foreach ($this->resolve($url) as $media) {
                if ($media->getId() === $original->getId()) {
                    // Conversion copies the source, not its cached thumbnails.
                    $newPath = '/media/' . rawurlencode((string) $original->getContext()) . '/0001/01/' . rawurlencode($newReference);

                    $parts = parse_url($url);

                    // Private copies use the application host so requests carry its session cookies.
                    return $this->parameters->get('router.request_context.scheme') . '://' . $this->parameters->get('router.request_context.host') . $newPath
                        . (isset($parts['query']) ? '?' . $parts['query'] : '')
                        . (isset($parts['fragment']) ? '#' . $parts['fragment'] : '');
                }
            }

            return $url;
        });
    }

    /** @return list<Media> */
    private function resolve(string $value): array
    {
        $url = parse_url(html_entity_decode(trim($value), \ENT_QUOTES | \ENT_HTML5, 'UTF-8'));
        if (false === $url || isset($url['scheme']) && !\in_array(strtolower($url['scheme']), ['http', 'https'], true)) {
            return [];
        }
        if (isset($url['host'])) {
            $assets = (string) $this->parameters->get('assets_host');
            $host = parse_url(str_contains($assets, '://') ? $assets : 'https://' . $assets, \PHP_URL_HOST);
            if (!\in_array(strtolower($url['host']), [strtolower((string) $this->parameters->get('router.request_context.host')), strtolower((string) $host)], true)) {
                return [];
            }
        }
        if (!preg_match('~^/media/(?:cache/(?:resolve/)?[^/]+/(?:rc/[^/]+/)?)?([^/]+)/0001/01/([^/]+)$~D', rawurldecode($url['path'] ?? ''), $parts)) {
            return [];
        }

        return array_values($this->medias->findBy(['context' => $parts[1], 'providerReference' => $parts[2]]));
    }

    /** Keep the original markup; only rewrite URL attributes, never surrounding text. */
    private function map(string $html, callable $transform): string
    {
        return (string) preg_replace_callback('~<[a-z](?:[^>\"\x27]|\"[^\"]*\"|\x27[^\x27]*\x27)*>~is', static fn (array $tag): string => (string) preg_replace_callback(
            '~(\s(?:src|href|poster|srcset)\s*=\s*)(?:"([^"]*)"|\x27([^\x27]*)\x27|([^\s>]+))~i',
            static function (array $attribute) use ($transform): string {
                $value = $attribute[2] ?? '';
                $quote = '"';
                if (str_contains($attribute[0], "'") && '' === $value) {
                    $value = $attribute[3] ?? '';
                    $quote = "'";
                } elseif (isset($attribute[4])) {
                    $value = $attribute[4];
                    $quote = '';
                }
                $mapped = (string) preg_replace_callback('~[^\s,]+~', static fn (array $token): string => $transform($token[0]), $value);

                return $attribute[1] . $quote . $mapped . $quote;
            },
            $tag[0]
        ), $html);
    }
}
