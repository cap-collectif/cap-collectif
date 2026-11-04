<?php

namespace Capco\Tests\UnitTests;

use Capco\AppBundle\Entity\Debate\Debate;
use Capco\AppBundle\Entity\Debate\DebateAnonymousArgument;
use Capco\AppBundle\Entity\Participant;
use Capco\AppBundle\GraphQL\Resolver\User\ContributorNameResolver;
use Capco\UserBundle\Entity\User;
use PHPUnit\Framework\TestCase;
use Symfony\Component\Translation\Loader\ArrayLoader;
use Symfony\Component\Translation\Translator;

/**
 * @internal
 *
 * @coversNothing
 *
 * @phpunit-status compliant
 *
 * @phpunit-reason Checks public name resolution with real contributors and locale catalogs, without a kernel or shared service replacement.
 */
final class ContributorNameResolverTest extends TestCase
{
    /** @dataProvider contributorNames */
    public function testUserNamesFollowAnonymizationStatus(string $locale, ?string $name, bool $anonymized, ?string $expected): void
    {
        $user = (new User())->setUsername($name);
        if ($anonymized) {
            $user->setAnonymizedAt(new \DateTime('2026-10-20'));
        }
        $resolver = $this->resolver($locale);

        self::assertSame($expected, $resolver->resolveUsername($user));
        self::assertSame($expected ?? 'Utilisateur sans nom', $resolver->resolveDisplayName($user));
    }

    /** @dataProvider contributorNames */
    public function testParticipantNamesFollowAnonymizationStatus(string $locale, ?string $name, bool $anonymized, ?string $expected): void
    {
        $participant = (new Participant())->setUsername($name);
        if ($anonymized) {
            $participant->setAnonymizedAt(new \DateTime('2026-10-20'));
        }
        $resolver = $this->resolver($locale);

        self::assertSame($expected, $resolver->resolveUsername($participant));
        self::assertSame($expected ?? 'Anonyme', $resolver->resolveDisplayName($participant));
    }

    /** @return iterable<string, array{string, ?string, bool, ?string}> */
    public static function contributorNames(): iterable
    {
        yield 'French anonymized profile' => ['fr-FR', 'global.user.anonymized', true, 'Profil anonymisé'];

        yield 'English anonymized profile' => ['en-GB', 'global.user.anonymized', true, 'Anonymized profile'];

        yield 'anonymized status overrides name' => ['fr-FR', 'Alice', true, 'Profil anonymisé'];

        yield 'anonymized status overrides missing name' => ['fr-FR', null, true, 'Profil anonymisé'];

        yield 'active name matching anonymized key' => ['fr-FR', 'global.user.anonymized', false, 'global.user.anonymized'];

        yield 'active name' => ['fr-FR', 'Alice', false, 'Alice'];

        yield 'legacy key keeps its meaning' => ['fr-FR', 'deleted-user', false, 'deleted-user'];

        yield 'missing active name' => ['fr-FR', null, false, null];
    }

    /** @dataProvider localizedNames */
    public function testAnonymousDebateNamesFollowTheLocaleCatalog(string $locale, ?string $name, ?string $expected): void
    {
        $argument = (new DebateAnonymousArgument(new Debate()))->setUsername($name);

        self::assertSame($expected, $this->resolver($locale)->resolveUsername($argument));
    }

    /** @return iterable<string, array{string, ?string, ?string}> */
    public static function localizedNames(): iterable
    {
        yield 'French anonymized profile' => ['fr-FR', 'global.user.anonymized', 'Profil anonymisé'];

        yield 'English anonymized profile' => ['en-GB', 'global.user.anonymized', 'Anonymized profile'];

        yield 'empty localized label' => ['de-DE', 'global.user.anonymized', 'Profil anonymisé'];

        yield 'missing localized label' => ['es-ES', 'global.user.anonymized', 'Profil anonymisé'];

        yield 'active name' => ['fr-FR', 'Alice', 'Alice'];

        yield 'missing name' => ['fr-FR', null, null];

        yield 'legacy key keeps its meaning' => ['fr-FR', 'deleted-user', 'deleted-user'];
    }

    private function resolver(string $locale): ContributorNameResolver
    {
        $translator = new Translator($locale);
        $translator->addLoader('array', new ArrayLoader());
        $translator->addResource('array', [
            'global.user.anonymized' => 'Profil anonymisé',
            'deleted-user' => 'Utilisateur supprimé',
        ], 'fr-FR', 'CapcoAppBundle');
        $translator->addResource('array', [
            'global.user.anonymized' => 'Anonymized profile',
            'deleted-user' => 'Deleted user',
        ], 'en-GB', 'CapcoAppBundle');

        $translator->addResource('array', ['global.user.anonymized' => ''], 'de-DE', 'CapcoAppBundle');

        return new ContributorNameResolver($translator);
    }
}
