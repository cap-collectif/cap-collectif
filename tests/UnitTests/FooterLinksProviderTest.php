<?php

namespace Capco\AppBundle\Tests\UnitTests;

use Capco\AppBundle\Entity\MenuItem;
use Capco\AppBundle\Manager\MenuItemResolver;
use Capco\AppBundle\Repository\MenuItemRepository;
use Capco\AppBundle\Service\FooterLinksProvider;
use PHPUnit\Framework\TestCase;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\RouterInterface;
use Symfony\Contracts\Translation\TranslatorInterface;

/**
 * @internal
 */
final class FooterLinksProviderTest extends TestCase
{
    public function testOnlySameOriginSitemapInCurrentLocaleIsDeduplicated(): void
    {
        $urls = [
            '/en/sitemap',
            'https://capco.test/en/sitemap?from=footer',
            '//capco.test/en/sitemap',
            'https://other.test/en/sitemap',
            'https://capco.test/sitemap',
            'http://capco.test/en/sitemap',
            'https://capco.test:8443/en/sitemap',
        ];
        $items = [];
        foreach ($urls as $url) {
            $item = $this->createMock(MenuItem::class);
            $item->method('getTitle')->willReturn($url);
            $item->method('isExternalLink')->willReturn(true);
            $items[] = $item;
        }

        $repository = $this->createMock(MenuItemRepository::class);
        $repository->method('getPublishedFooterPages')->willReturn($items);
        $resolver = $this->createMock(MenuItemResolver::class);
        $resolver->method('getMenuUrl')->willReturnCallback(static fn (MenuItem $item) => $item->getTitle());
        $router = $this->createMock(RouterInterface::class);
        $router->method('generate')->willReturn('/en/sitemap');
        $translator = $this->createMock(TranslatorInterface::class);
        $translator->method('trans')->willReturn('Sitemap');
        $request = Request::create('https://capco.test/en/sitemap');
        $request->setLocale('en-GB');

        $links = (new FooterLinksProvider($repository, $resolver, $router, $translator))->getLinks($request, 'en-GB');

        self::assertSame(\array_slice($urls, 3), array_column(\array_slice($links, 0, -1), 'url'));
        self::assertSame(['name' => 'Sitemap', 'url' => '/en/sitemap', 'isExternalLink' => false], end($links));
    }
}
