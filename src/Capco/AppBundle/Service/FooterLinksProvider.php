<?php

namespace Capco\AppBundle\Service;

use Capco\AppBundle\Entity\MenuItem;
use Capco\AppBundle\Manager\MenuItemResolver;
use Capco\AppBundle\Repository\MenuItemRepository;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\RouterInterface;
use Symfony\Contracts\Translation\TranslatorInterface;

class FooterLinksProvider
{
    public function __construct(
        private readonly MenuItemRepository $menuItemRepository,
        private readonly MenuItemResolver $menuItemResolver,
        private readonly RouterInterface $router,
        private readonly TranslatorInterface $translator,
    ) {}

    /** @return array<array{name: string, url: string, isExternalLink: bool}> */
    public function getLinks(Request $request, string $locale): array
    {
        $sitemapUrl = $this->router->generate('app_sitemap_html', ['_locale' => $request->getLocale()]);
        $links = [];

        foreach ($this->menuItemRepository->getPublishedFooterPages() as $menuItem) {
            $name = $this->getTitle($menuItem, $locale);
            $url = $this->menuItemResolver->getMenuUrl($menuItem, $request);
            if ('' === trim($name) || $this->isSitemapUrl($url, $sitemapUrl, $request)) {
                continue;
            }
            $links[] = ['name' => $name, 'url' => $url, 'isExternalLink' => $menuItem->isExternalLink()];
        }

        $links[] = [
            'name' => $this->translator->trans('sitemap.title', [], 'CapcoAppBundle', $request->getLocale()),
            'url' => $sitemapUrl,
            'isExternalLink' => false,
        ];

        return $links;
    }

    private function getTitle(MenuItem $menuItem, string $locale): string
    {
        $title = $menuItem->getTitle($locale, true);
        if (\is_string($title) && '' !== trim($title)) {
            return $title;
        }

        if ($menuItem->getPage()) {
            $title = $menuItem->getPage()->getTitle($locale);
            if (\is_string($title) && '' !== trim($title)) {
                return $title;
            }
        }

        return '';
    }

    private function isSitemapUrl(string $url, string $sitemapUrl, Request $request): bool
    {
        $parts = parse_url($url);
        if (false === $parts || ($parts['path'] ?? '') !== $sitemapUrl) {
            return false;
        }
        if (!isset($parts['host'])) {
            return !isset($parts['scheme']);
        }

        $scheme = strtolower($parts['scheme'] ?? $request->getScheme());
        $port = $parts['port'] ?? ('https' === $scheme ? 443 : 80);

        return $scheme === $request->getScheme()
            && strtolower($parts['host']) === strtolower($request->getHost())
            && $port === $request->getPort();
    }
}
