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
}
