<?php

namespace Capco\Tests\UnitTests;

use Capco\AppBundle\Cache\RedisCache;
use Capco\AppBundle\Entity\MenuItem;
use Capco\AppBundle\GraphQL\Resolver\Locale\GraphQLLocaleResolver;
use Capco\AppBundle\GraphQL\Resolver\MenuItemLinkResolver;
use Capco\AppBundle\Manager\MenuItemResolver;
use Capco\AppBundle\Repository\MenuItemRepository;
use Capco\AppBundle\Service\MenuItemUrlGenerator;
use Capco\AppBundle\Toggle\Manager;
use PHPUnit\Framework\TestCase;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\RequestStack;
use Symfony\Component\Routing\Generator\UrlGenerator;
use Symfony\Component\Routing\Matcher\UrlMatcher;
use Symfony\Component\Routing\RequestContext;
use Symfony\Component\Routing\Route;
use Symfony\Component\Routing\RouteCollection;
use Symfony\Component\Routing\RouterInterface;
use Symfony\Component\Validator\Validation;

/**
 * @internal
 * @coversNothing
 */
final class MenuItemUrlTest extends TestCase
{
    /**
     * @dataProvider menuUrlProvider
     */
    public function testTwigMenuPreservesUrlComponents(string $link, string $expected): void
    {
        $request = new Request();
        $request->setLocale('fr-FR');
        $item = (new MenuItem())->setLink($link);
        $resolver = new MenuItemResolver(
            $this->createStub(MenuItemRepository::class),
            $this->createStub(Manager::class),
            new MenuItemUrlGenerator($this->createRouter(), Validation::createValidator()),
            $this->createStub(RedisCache::class),
            new RequestStack()
        );

        self::assertSame($expected, $resolver->getMenuUrl($item, $request));
    }

    /**
     * @dataProvider menuUrlProvider
     */
    public function testGraphQLMenuPreservesUrlComponents(string $link, string $expected): void
    {
        $request = new Request();
        $request->setLocale('fr-FR');
        $requestStack = new RequestStack();
        $requestStack->push($request);
        $localeResolver = $this->createStub(GraphQLLocaleResolver::class);
        $localeResolver->method('resolveFromRequest')->willReturn('fr-FR');
        $item = (new MenuItem())->setLink($link);
        $resolver = new MenuItemLinkResolver(
            new MenuItemUrlGenerator($this->createRouter(), Validation::createValidator()),
            $localeResolver
        );

        self::assertSame($expected, $resolver($item, $requestStack));
    }

    /**
     * @return array<string, array{string, string}>
     */
    public function menuUrlProvider(): array
    {
        return [
            'theme filter' => ['projects?theme=theme1', '/projects?theme=theme1'],
            'type filter' => ['projects?type=1', '/projects?type=1'],
            'multiple filters' => ['projects?theme=theme1&type=1', '/projects?theme=theme1&type=1'],
            'encoded values and repeated keys' => ['projects?q=a%26b&q=c+d', '/projects?q=a%26b&q=c+d'],
            'fragment' => ['projects#list', '/projects#list'],
            'query and fragment' => ['projects?theme=theme1#list', '/projects?theme=theme1#list'],
            'leading slash' => ['/projects?theme=theme1', '/projects?theme=theme1'],
            'CMS fallback' => ['custom-page?type=1#content', '/custom-page?type=1#content'],
            'plain relative link' => ['projects', '/projects'],
            'homepage' => ['/', '/'],
            'homepage query' => ['/?type=1', '/?type=1'],
            'absolute link' => ['https://example.org/projects?type=1#list', 'https://example.org/projects?type=1#list'],
            'empty link' => ['', ''],
        ];
    }

    private function createRouter(): RouterInterface
    {
        $routes = new RouteCollection();
        $routes->add('app_homepage', new Route('/', ['_locale' => 'fr-FR']));
        $routes->add('app_project', new Route('/projects', ['_locale' => 'fr-FR']));
        $routes->add('capco_app_cms', new Route('/{url}', [], ['url' => '.*']));
        $context = new RequestContext();
        $matcher = new UrlMatcher($routes, $context);
        $generator = new UrlGenerator($routes, $context);
        $router = $this->createStub(RouterInterface::class);
        $router->method('match')->willReturnCallback($matcher->match(...));
        $router->method('generate')->willReturnCallback($generator->generate(...));

        return $router;
    }
}
