<?php

namespace Capco\Tests\UserBundle\Entity;

use Capco\AppBundle\Entity\Opinion;
use Capco\UserBundle\Entity\User;
use Doctrine\Common\Collections\ArrayCollection;
use PHPUnit\Framework\TestCase;

/**
 * @internal
 * @phpunit-status compliant
 * @phpunit-reason Checks public domain rules with real entities and observable results, without framework interaction counts.
 */
class UserTest extends TestCase
{
    public function testSecurityIdentifierUsesEmailAndAllowsAnonymizedIdentity(): void
    {
        $user = new User();
        self::assertSame('', $user->getUserIdentifier());
        $user->setEmail('Person@example.com');
        self::assertSame('Person@example.com', $user->getUserIdentifier());
        $user->setEmail(null);
        self::assertSame('', $user->getUserIdentifier());
    }

    public function testSecurityIdentityComparisonRejectsDeletedAndDifferentAccounts(): void
    {
        $user = (new User())->setId('account-one');
        $sameIdentity = (new User())->setId('account-one');
        self::assertTrue($user->isEqualTo($sameIdentity));
        self::assertFalse($user->isEqualTo((new User())->setId('account-two')));
        $sameIdentity->setDeletedAccountAt(new \DateTime('2026-01-01 00:00:00 UTC'));
        self::assertFalse($user->isEqualTo($sameIdentity));
    }

    public function testEmailConfirmationIsIndependentOfEnabledAndLockedStates(): void
    {
        $user = new User();
        self::assertFalse($user->isEnabled());
        self::assertFalse($user->isLocked());
        self::assertTrue($user->isEmailConfirmed());
        $user->setConfirmationToken('confirmation');
        $user->setEnabled(true);
        self::assertFalse($user->isEmailConfirmed());
        $user->setConfirmationToken(null);
        $user->setLocked(true);
        self::assertTrue($user->isEmailConfirmed());
        self::assertTrue($user->isEnabled());
        self::assertTrue($user->isLocked());
    }

    /** @dataProvider canonicalIdentities */
    public function testCanonicalizationLowercasesIdentityWithoutTrimming(string $identity, string $expected): void
    {
        $canonicalizer = new \Capco\AppBundle\Utils\Canonicalizer();

        self::assertSame($expected, $canonicalizer->canonicalize($identity));
    }

    /** @return iterable<string, array{string, string}> */
    public static function canonicalIdentities(): iterable
    {
        yield 'email with surrounding spaces' => [' MiXeD@gmail.com ', ' mixed@gmail.com '];
        yield 'username with surrounding spaces' => [' MiXeD Username ', ' mixed username '];
    }

    public function testContributionsIncludeOpinions(): void
    {
        $user = new User();
        $opinion = new Opinion();
        $user->setOpinions(new ArrayCollection([$opinion]));

        self::assertSame([$opinion], $user->getContributions());
    }
}
