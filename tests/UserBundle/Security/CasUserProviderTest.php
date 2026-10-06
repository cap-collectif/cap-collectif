<?php

namespace Capco\Tests\UserBundle\Security;

use Capco\Tests\IdentityWebTestCase;
use Overblog\GraphQLBundle\Relay\Node\GlobalId;

/**
 * @internal
 * @runTestsInSeparateProcesses
 * @preserveGlobalState disabled
 * @phpunit-status compliant
 * @phpunit-reason Exercises HTTP outcomes and real domain data with transactional cleanup; replaces only external boundaries.
 */
final class CasUserProviderTest extends IdentityWebTestCase
{
    /** @dataProvider accountStates */
    public function testCasLoginCreatesOrReusesItsLocalAccountWithoutOverwritingItsProfile(bool $existing): void
    {
        $configuration = $this->em->getRepository(\Capco\AppBundle\Entity\SSO\CASSSOConfiguration::class)->findOneBy([]) ?? new \Capco\AppBundle\Entity\SSO\CASSSOConfiguration();
        $configuration->setEnabled(true);
        $this->em->persist($configuration);
        $this->em->flush();
        $this->setFeature('login_cas', true);
        $identifier = 'cas-' . bin2hex(random_bytes(8));
        $expectedEmail = $identifier . '@fake-email-cap-collectif.com';
        $expectedUsername = $identifier;
        $existingId = null;
        $existingPassword = null;
        if ($existing) {
            $account = $this->account()->setCasId($identifier)->setUsername('Updated CAS profile');
            $expectedEmail = $account->getEmail();
            $expectedUsername = 'Updated CAS profile';
            $existingId = $account->getId();
            $existingPassword = $account->getPassword();
            $this->em->flush();
        }
        $cas = $this->createStub(\Capco\UserBundle\Handler\CasHandler::class);
        self::getContainer()->set(\Capco\UserBundle\Handler\CasHandler::class, $cas);
        $session = self::getContainer()->get('session');
        $session->set('cas_login', $identifier);
        $session->save();
        $this->browser->getCookieJar()->set(new \Symfony\Component\BrowserKit\Cookie($session->getName(), $session->getId()));
        $viewer = $this->graphql('{ viewer { id username email } }')['viewer'];
        $this->em->clear();
        $user = $this->em->getRepository(\Capco\UserBundle\Entity\User::class)->findOneBy(['casId' => $identifier]);
        self::assertNotNull($user);
        self::assertSame($expectedUsername, $user->getUsername());
        self::assertSame($expectedEmail, $user->getEmail());
        self::assertTrue($user->isEnabled());
        self::assertCount(1, $user->getUserGroups());
        self::assertSame('CAS', $user->getUserGroups()->first()->getGroup()->getTitle());
        $id = $user->getId();
        self::assertSame(GlobalId::toGlobalId('User', $id), $viewer['id']);
        self::assertSame($expectedUsername, $viewer['username']);
        self::assertSame($expectedEmail, $viewer['email']);
        if ($existing) {
            self::assertSame($existingId, $id);
            self::assertSame($existingPassword, $user->getPassword());
        }
        $viewer = $this->graphql('{ viewer { id } }')['viewer'];
        self::assertSame(GlobalId::toGlobalId('User', $id), $viewer['id']);
        $this->em->clear();
        self::assertCount(1, $this->em->getRepository(\Capco\UserBundle\Entity\User::class)->findBy(['casId' => $identifier]));
        $persisted = $this->em->find(\Capco\UserBundle\Entity\User::class, $id);
        self::assertCount(1, $persisted->getUserGroups());
        self::assertSame($expectedUsername, $persisted->getUsername());
        self::assertSame($expectedEmail, $persisted->getEmail());
        if ($existing) {
            self::assertSame($existingPassword, $persisted->getPassword());
        }
    }

    /** @return iterable<string, array{bool}> */
    public static function accountStates(): iterable
    {
        yield 'new CAS account' => [false];
        yield 'existing account with updated profile' => [true];
    }
}
