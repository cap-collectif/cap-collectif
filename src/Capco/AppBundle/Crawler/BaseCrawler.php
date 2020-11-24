<?php

namespace Capco\AppBundle\Crawler;

use Symfony\Component\Panther\Client;

abstract class BaseCrawler
{
    protected Client $crawler;

    public function __construct()
    {
        $this->crawler = Client::createChromeClient(null, [
            '--user-agent=' . random_user_agent(),
            '--headless',
            '--disable-gpu',
        ]);
    }

    abstract public function crawl(string $url);

    protected function buildMetaSelector(array $values): string {
        return implode(",", array_map(static fn (string $propertyName) => "meta[property='$propertyName'],meta[name='$propertyName']", $values));
    }

    protected function isAbsolutePath(string $path): string
    {
        return strspn($path, '/\\', 0, 1)
            || (strlen($path) > 3 && ctype_alpha($path[0])
                && substr($path, 1, 1) === ':'
                && strspn($path, '/\\', 2, 1)
            )
            || null !== parse_url($path, PHP_URL_SCHEME);
    }
}
