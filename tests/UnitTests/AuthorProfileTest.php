<?php

namespace Capco\Tests\UnitTests;

use Capco\AppBundle\Entity\Organization\Organization;
use Capco\AppBundle\GraphQL\Resolver\User\ContributorNameResolver;
use Capco\AppBundle\Toggle\Manager;
use Capco\AppBundle\Twig\AuthorExtension;
use Capco\AppBundle\Twig\AuthorRuntime;
use Capco\UserBundle\Entity\User;
use PHPUnit\Framework\TestCase;
use Symfony\Component\DomCrawler\Crawler;
use Symfony\Component\Routing\Generator\UrlGenerator;
use Symfony\Component\Routing\RequestContext;
use Symfony\Component\Routing\Route;
use Symfony\Component\Routing\RouteCollection;
use Symfony\Component\Translation\Loader\ArrayLoader;
use Symfony\Component\Translation\Translator;
use Twig\Environment;
use Twig\Loader\FilesystemLoader;
use Twig\RuntimeLoader\FactoryRuntimeLoader;
use Twig\TwigFilter;
use Twig\TwigFunction;

/**
 * @internal
 *
 * @coversNothing
 *
 * @phpunit-status compliant
 *
 * @phpunit-reason Checks author presentation and Twig avatar properties with real entities and routing; feature flags, template labels and React rendering are simulated at their boundaries.
 */
final class AuthorProfileTest extends TestCase
{
    /** @dataProvider userProfiles */
    public function testUserProfilePresentation(
        string $name,
        string $locale,
        bool $anonymized,
        bool $deleted,
        bool $profilesEnabled,
        bool $private,
        string $expectedName,
        ?string $expectedUrl
    ): void {
        $user = (new User())->setId('alice-id')->setUsername($name)->setSlug('alice');
        if ($anonymized) {
            $user->setAnonymizedAt(new \DateTime('2026-10-20'));
        }
        if ($deleted) {
            $user->setDeletedAccountAt(new \DateTime('2026-10-20'));
        }

        $profile = $this->runtime($profilesEnabled, $locale)->getProfile($user, $private);

        self::assertSame(['name' => $expectedName, 'url' => $expectedUrl, 'globalId' => 'VXNlcjphbGljZS1pZA=='], $profile);
        $this->assertThumbnail($user, $profilesEnabled, $private, $locale, $private ? 'global.anonymous' : $expectedName, $expectedUrl);
    }

    /** @return iterable<string, array{string, string, bool, bool, bool, bool, string, ?string}> */
    public static function userProfiles(): iterable
    {
        yield 'active profile' => ['Alice', 'fr-FR', false, false, true, false, 'Alice', '/profile/alice'];

        yield 'anonymized in French' => ['global.user.anonymized', 'fr-FR', true, false, true, false, 'Profil anonymisé', null];

        yield 'anonymized in English' => ['global.user.anonymized', 'en-GB', true, false, true, false, 'Anonymized profile', null];

        yield 'deleted account' => ['global.user.anonymized', 'fr-FR', false, true, true, false, 'Profil anonymisé', null];

        yield 'both timestamps' => ['global.user.anonymized', 'fr-FR', true, true, true, false, 'Profil anonymisé', null];

        yield 'status does not depend on name' => ['Alice', 'fr-FR', true, false, true, false, 'Profil anonymisé', null];

        yield 'profiles disabled' => ['Alice', 'fr-FR', false, false, false, false, 'Alice', null];

        yield 'private author' => ['Alice', 'fr-FR', false, false, true, true, 'Alice', null];

        yield 'username matching another translation' => ['deleted-user', 'fr-FR', false, false, true, false, 'deleted-user', '/profile/alice'];

        yield 'name does not determine status' => ['global.user.anonymized', 'fr-FR', false, false, true, false, 'global.user.anonymized', '/profile/alice'];
    }

    /** @dataProvider organizationProfiles */
    public function testOrganizationProfilePresentation(bool $profilesEnabled, bool $private, ?string $expectedUrl): void
    {
        $organization = new Organization();
        $organization->setId('collective-id');
        $organization->setTitle('global.user.anonymized');
        $organization->setSlug('collective');

        $profile = $this->runtime($profilesEnabled)->getProfile($organization, $private);

        self::assertSame(['name' => 'global.user.anonymized', 'url' => $expectedUrl, 'globalId' => 'T3JnYW5pemF0aW9uOmNvbGxlY3RpdmUtaWQ='], $profile);
        $this->assertThumbnail($organization, $profilesEnabled, $private, 'fr-FR', $private ? 'global.anonymous' : 'global.user.anonymized', $expectedUrl);
    }

    /** @return iterable<string, array{bool, bool, ?string}> */
    public static function organizationProfiles(): iterable
    {
        yield 'organization route' => [true, false, '/organization/collective'];

        yield 'profiles disabled' => [false, false, null];

        yield 'private organization' => [true, true, null];
    }

    public function testMissingAuthorHasNoNameOrLink(): void
    {
        self::assertSame(['name' => null, 'url' => null, 'globalId' => null], $this->runtime()->getProfile(null));
    }

    public function testOrganizationAvatarReceivesAnOrganizationId(): void
    {
        $organization = new Organization();
        $organization->setId('collective-id')->setTitle('Collective')->setSlug('collective');
        $runtime = $this->runtime();
        $twig = new Environment(new FilesystemLoader(__DIR__ . '/../../src/Capco/UserBundle/Resources/views'));
        $twig->addExtension(new AuthorExtension());
        $twig->addRuntimeLoader(new FactoryRuntimeLoader([AuthorRuntime::class => static fn () => $runtime]));
        $twig->addFilter(new TwigFilter('trans', static fn (string $message): string => $message));
        $twig->addFunction(new TwigFunction('react_render_component', static fn (string $component, array $options): string => json_encode($options['props'], \JSON_THROW_ON_ERROR), ['is_safe' => ['html']]));

        $html = $twig->render('Avatar/avatar.html.twig', ['user' => $organization]);

        self::assertStringContainsString('"userId":"T3JnYW5pemF0aW9uOmNvbGxlY3RpdmUtaWQ="', $html);
    }

    private function assertThumbnail(Organization|User $author, bool $profilesEnabled, bool $private, string $locale, string $expectedName, ?string $expectedUrl): void
    {
        $loader = new FilesystemLoader(__DIR__ . '/../../src/Capco/AppBundle/Resources/views');
        $loader->addPath(__DIR__ . '/../../src/Capco/UserBundle/Resources/views', 'CapcoUser');
        $twig = new Environment($loader);
        $runtime = $this->runtime($profilesEnabled, $locale);
        $twig->addExtension(new AuthorExtension());
        $twig->addRuntimeLoader(new FactoryRuntimeLoader([AuthorRuntime::class => static fn () => $runtime]));
        $twig->addFilter(new TwigFilter('trans', static fn (string $message): string => $message));
        $twig->addFunction(new TwigFunction('react_render_component', static fn (): string => '<img alt="" />', ['is_safe' => ['html']]));

        $html = $twig->render('Default/user_thumbnail.html.twig', [
            'user' => $author,
            'private' => $private,
            'col' => 4,
            'contributions' => 2,
            'votes' => 1,
        ]);
        $crawler = new Crawler($html);

        self::assertSame($expectedName, $crawler->filter('p')->text());
        self::assertCount(null === $expectedUrl ? 0 : 2, $crawler->filter('a'));
        foreach ($crawler->filter('a') as $link) {
            self::assertSame($expectedUrl, $link->getAttribute('href'));
        }
    }

    private function runtime(bool $profilesEnabled = true, string $locale = 'fr-FR'): AuthorRuntime
    {
        $translator = new Translator($locale);
        $translator->addLoader('array', new ArrayLoader());
        $translator->addResource('array', [
            'global.user.anonymized' => 'Profil anonymisé',
            'deleted-user' => 'Utilisateur supprimé',
        ], 'fr-FR', 'CapcoAppBundle');
        $translator->addResource('array', [
            'global.user.anonymized' => 'Anonymized profile',
        ], 'en-GB', 'CapcoAppBundle');

        $routes = new RouteCollection();
        $routes->add('capco_user_profile_show_all', new Route('/profile/{slug}'));
        $routes->add('capco_organization_profile_show_all', new Route('/organization/{slug}'));
        $router = new UrlGenerator($routes, new RequestContext());
        $toggleManager = $this->createStub(Manager::class);
        $toggleManager->method('isActive')->willReturn($profilesEnabled);

        return new AuthorRuntime(new ContributorNameResolver($translator), $router, $toggleManager);
    }
}
