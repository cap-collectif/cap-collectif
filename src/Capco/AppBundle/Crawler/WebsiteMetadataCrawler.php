<?php


namespace Capco\AppBundle\Crawler;


use DateTimeImmutable;
use DateTimeInterface;
use Exception;
use Symfony\Component\Panther\DomCrawler\Crawler;

class WebsiteMetadataCrawler extends BaseCrawler
{
    private const NAME_METADATA_NAMES = [
        'og:site_name',
        'application-name',
        'twitter:app:name:googleplay',
        'twitter:app:name:ipad',
        'twitter:app:name:iphone',
        'apple-mobile-web-app-title',
        'al:android:app_name',
        'al:ios:app_name',
    ];

    /**
     * See https://schema.org/Article and more specifically types that implements this itemprop.
     * Those types should have the `datePublished` prop
     */
    private const PUBLISHED_AT_ITEMPROP_TYPES = [
        'Article',
        'AdvertiserContentArticle',
        'NewsArticle',
        'Report',
        'SatiricalArticle',
        'ScholarlyArticle',
        'SocialMediaPosting',
        'TechArticle'
    ];
    private const PUBLISHED_AT_METADATA_NAME = 'datePublished';
    private const TITLE_METADATA_NAMES = ['og:title', 'twitter:title'];
    private const IMAGE_METADATA_NAMES = ['og:image', 'twitter:image'];
    private const DESCRIPTION_METADATA_NAMES = ['og:description', 'twitter:description', 'description'];

    /**
     * @param string $url
     *
     * @return array{url: string, title: string, crawledAt: ?\DateTimeInterface, publishedAt: ?\DateTimeInterface, name: ?string, image: ?string, description: ?string}
     */
    public function crawl(string $url): array
    {
        $page = $this->crawler->request('GET', $url);
        $metadata = [
            'url' => $url,
            'title' => $this->getTitle($page),
            'crawledAt' => null,
            'publishedAt' => null,
            'name' => null,
            'image' => null,
            'description' => null,
        ];
        if ($page->text() !== "") {
            $metadata['crawledAt'] = new DateTimeImmutable();
            $metadata['publishedAt'] = $this->getPublishedAt($page);
            $metadata['name'] = $this->getName($page, $url);
            $metadata['image'] = $this->getImage($page);
            $metadata['description'] = $this->getDescription($page);
        }

        return $metadata;
    }

    private function getTitle(Crawler $page): string
    {
        $selector = $this->buildMetaSelector(self::TITLE_METADATA_NAMES);

        return $page->filter($selector)->count() === 0 ?
            $page->filter('title')->attr('innerText') :
            $page->filter($selector)->first()->attr('content');
    }

    private function getName(Crawler $page, string $url): string
    {
        $selector = $this->buildMetaSelector(self::NAME_METADATA_NAMES);

        return $page->filter($selector)->count() === 0 ?
            parse_url($url, PHP_URL_HOST) :
            $page->filter($selector)->first()->attr('content');
    }

    private function getDescription(Crawler $page): ?string
    {
        $selector = $this->buildMetaSelector(self::DESCRIPTION_METADATA_NAMES);

        return $page->filter($selector)->count() === 0 ?
            null :
            $page->filter($selector)->first()->attr('content');
    }

    private function getPublishedAt(Crawler $page): ?DateTimeInterface
    {
        try {
            $selector = '[itemprop="' . self::PUBLISHED_AT_METADATA_NAME . '"]';

            return $page->filter($selector)->count() === 0 ?
                $this->findDatePublished($page) :
                new DateTimeImmutable($page->filter($selector)->first()->attr('datetime'));
        } catch (Exception $ex) {
            return null;
        }
    }

    private function findDatePublished(Crawler $page): ?DateTimeInterface
    {
        try {
            $selector = 'script[type="application/ld+json"]';

            $datePublished = null;
            $page->filter($selector)->each(function (Crawler $element) use (&$datePublished) {
                $json = json_decode($element->attr('innerText'), true);
                if (
                    isset($json['@type'], $json[self::PUBLISHED_AT_METADATA_NAME]) &&
                    in_array($json['@type'], self::PUBLISHED_AT_ITEMPROP_TYPES, true)) {
                    $datePublished = new DateTimeImmutable($json[self::PUBLISHED_AT_METADATA_NAME]);
                }
            });

            return $datePublished;
        } catch (Exception $ex) {
            return null;
        }

    }

    private function getImage(Crawler $page): ?string
    {
        $selector = $this->buildMetaSelector(self::IMAGE_METADATA_NAMES);

        $image = $page->filter($selector)->count() === 0 ?
            null :
            $page->filter($selector)->first()->attr('content');
        return $image && $this->isAbsolutePath($image) ? $image : null;
    }
}
