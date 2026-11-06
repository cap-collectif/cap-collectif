<?php

namespace Capco\AppBundle\Tests\UnitTests;

use Capco\AppBundle\Enum\UserRole;
use Capco\AppBundle\GraphQL\Resolver\SitemapResolver;
use Capco\AppBundle\Service\HtmlSitemapProjectsProvider;
use Capco\AppBundle\Toggle\Manager;
use Capco\AppBundle\Twig\FooterRuntime;
use Capco\AppBundle\Twig\NavigationRuntime;
use Capco\AppBundle\Twig\SiteColorRuntime;
use Capco\UserBundle\Entity\User;
use PHPUnit\Framework\TestCase;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\RequestStack;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;
use Symfony\Component\Routing\RouterInterface;
use Symfony\Component\Security\Core\Role\RoleHierarchy;

/** @internal */
final class SitemapResolverTest extends TestCase
{
    public function testReturnsFreshSitemapDataInRequestLocale(): void
    {
        $projects = $this->createMock(HtmlSitemapProjectsProvider::class);
        $projects->expects(self::once())->method('getProjects')->with('en-GB')->willReturn([]);
        $navigation = $this->createMock(NavigationRuntime::class);
        $navigation->expects(self::once())->method('getHeaders')->with('/en/sitemap', false)->willReturn([]);
        $footer = $this->createMock(FooterRuntime::class);
        $footer->method('getFooterLinks')->willReturn([]);
        $footer->expects(self::never())->method('getFooterSocialNetworks');
        $footer->expects(self::once())->method('getLegalsPages')->with(false)->willReturn(['cookies' => true, 'legal' => true, 'privacy' => true]);
        $colors = $this->createMock(SiteColorRuntime::class);
        $colors->method('getSiteColorValue')->willReturn('#123456');
        $router = $this->createMock(RouterInterface::class);
        $router->method('generate')->willReturnCallback(static fn (string $name) => 'app_sitemap_html' === $name ? '/en/sitemap' : '/en/');
        $manager = $this->createMock(Manager::class);
        $manager->method('isActive')->with('shield_mode')->willReturn(false);
        $request = Request::create('/graphql/internal');
        $request->setLocale('en-GB');
        $requests = new RequestStack();
        $requests->push($request);

        $result = (new SitemapResolver($projects, $navigation, $footer, $colors, $requests, $router, $manager, new RoleHierarchy([])))(null);

        self::assertSame('/en/', $result['homeUrl']);
        self::assertSame('/en/sitemap', $result['sitemapUrl']);
        self::assertSame('#123456', $result['linkColor']);
    }

    public function testAnonymousVisitorCannotAccessSitemapInShieldMode(): void
    {
        $manager = $this->createMock(Manager::class);
        $manager->method('isActive')->with('shield_mode')->willReturn(true);
        $resolver = new SitemapResolver(
            $this->createMock(HtmlSitemapProjectsProvider::class),
            $this->createMock(NavigationRuntime::class),
            $this->createMock(FooterRuntime::class),
            $this->createMock(SiteColorRuntime::class),
            new RequestStack(),
            $this->createMock(RouterInterface::class),
            $manager,
            new RoleHierarchy([]),
        );

        $this->expectException(AccessDeniedHttpException::class);
        $resolver(null);
    }

    public function testUnauthorizedUserCannotAccessSitemapInRestrictedShieldMode(): void
    {
        $manager = $this->createMock(Manager::class);
        $manager->method('isActive')->willReturn(true);
        $resolver = new SitemapResolver(
            $this->createMock(HtmlSitemapProjectsProvider::class),
            $this->createMock(NavigationRuntime::class),
            $this->createMock(FooterRuntime::class),
            $this->createMock(SiteColorRuntime::class),
            new RequestStack(),
            $this->createMock(RouterInterface::class),
            $manager,
            new RoleHierarchy([]),
        );

        $this->expectException(AccessDeniedHttpException::class);
        $resolver(new User());
    }

    /**
     * @dataProvider allowedShieldUsers
     *
     * @param list<string> $roles
     */
    public function testAllowedUsersCanAccessSitemap(bool $controls, bool $authorizedOnly, array $roles): void
    {
        $manager = $this->createStub(Manager::class);
        $manager->method('isActive')->willReturnCallback(static fn (string $flag): bool => match ($flag) {
            Manager::shield_mode => true,
            Manager::shield_authorization_controls => $controls,
            Manager::shield_authorized_users_only => $authorizedOnly,
            default => false,
        });
        $request = Request::create('/graphql/internal');
        $request->setLocale('fr-FR');
        $requests = new RequestStack();
        $requests->push($request);
        $router = $this->createStub(RouterInterface::class);
        $router->method('generate')->willReturn('/');
        $footer = $this->createStub(FooterRuntime::class);
        $footer->method('getFooterLinks')->willReturn([]);
        $resolver = new SitemapResolver(
            $this->createStub(HtmlSitemapProjectsProvider::class),
            $this->createStub(NavigationRuntime::class),
            $footer,
            $this->createStub(SiteColorRuntime::class),
            $requests,
            $router,
            $manager,
            new RoleHierarchy(['ROLE_ADMIN' => [UserRole::ROLE_SHIELD_AUTHORIZED_USER]]),
        );
        $user = new User();
        $user->setRoles($roles);

        self::assertSame('/', $resolver($user)['homeUrl']);
    }

    /** @return array<string, array{bool, bool, list<string>}> */
    public static function allowedShieldUsers(): array
    {
        return [
            'restriction disabled' => [false, true, []],
            'authorized users only disabled' => [true, false, []],
            'authorized role' => [true, true, [UserRole::ROLE_SHIELD_AUTHORIZED_USER]],
            'inherited authorized role' => [true, true, ['ROLE_ADMIN']],
        ];
    }
}
