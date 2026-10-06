<?php

declare(strict_types=1);

namespace Capco\Tests\UserBundle\Security;

use Capco\Tests\SamlWebTestCase;
use Capco\UserBundle\Entity\User;

/**
 * @internal
 * @runTestsInSeparateProcesses
 * @preserveGlobalState disabled
 * @phpunit-status compliant
 * @phpunit-reason Exercises SAML login through HTTP and reloads SQL effects; only the external SAML client is replaced.
 */
final class SamlUserProviderTest extends SamlWebTestCase
{
    /** @dataProvider accountStates */
    public function testLoginCreatesOrReusesAnAccountAndPreservesItsLocalProfile(string $state): void
    {
        $identifier = $this->uniqueEmail();
        $this->samlIdentifier = $identifier;
        $expectedUsername = $identifier;
        $expectedEmail = $identifier;
        $existingId = null;
        $existingPassword = null;
        if ('new' !== $state) {
            $account = $this->account($identifier)->setUsername('Local SAML profile');
            if ('linked' === $state) {
                $account->setSamlId($identifier);
                $account->setEmail($this->uniqueEmail());
            }
            $expectedEmail = $account->getEmail();
            $expectedUsername = $account->getUsername();
            $existingId = $account->getId();
            $existingPassword = $account->getPassword();
            $this->em->flush();
        }
        $neighbor = $this->account();
        $neighborId = $neighbor->getId();
        $neighborEmail = $neighbor->getEmail();
        $this->configureSaml(['email' => [$identifier]]);

        $this->browser->request('GET', '/login-saml?_destination=/projects');

        self::assertSame(302, $this->browser->getResponse()->getStatusCode());
        self::assertSame('/projects', $this->browser->getResponse()->headers->get('Location'));
        $this->em->clear();
        $account = $this->em->getRepository(User::class)->findOneBy(['samlId' => $identifier]);
        self::assertInstanceOf(User::class, $account);
        $id = $account->getId();
        self::assertSame($expectedUsername, $account->getUsername());
        self::assertSame($expectedEmail, $account->getEmail());
        self::assertTrue($account->isEnabled());
        self::assertNotEmpty($account->getPassword());
        self::assertCount(1, $account->getUserGroups());
        self::assertSame('SAML', $account->getUserGroups()->first()->getGroup()->getTitle());
        if (null !== $existingId) {
            self::assertSame($existingId, $id);
            self::assertSame($existingPassword, $account->getPassword());
        }
        $this->assertViewer(true, $id);

        $this->browser->request('GET', '/login-saml');
        self::assertSame(302, $this->browser->getResponse()->getStatusCode());
        self::assertSame('/', $this->browser->getResponse()->headers->get('Location'));
        $this->assertViewer(true, $id);
        $this->em->clear();
        self::assertCount(1, $this->em->getRepository(User::class)->findBy(['samlId' => $identifier]));
        $account = $this->reload($id);
        self::assertSame($expectedUsername, $account->getUsername());
        self::assertSame($expectedEmail, $account->getEmail());
        self::assertCount(1, $account->getUserGroups());
        if (null !== $existingPassword) {
            self::assertSame($existingPassword, $account->getPassword());
        }
        $neighbor = $this->reload($neighborId);
        self::assertNull($neighbor->getSamlId());
        self::assertSame($neighborEmail, $neighbor->getEmail());
        self::assertCount(0, $neighbor->getUserGroups());
    }

    public function testEmptyProviderResponseRejectsLoginWithoutLinkingAnAccount(): void
    {
        $account = $this->account();
        $id = $account->getId();
        $password = $account->getPassword();
        $this->configureSaml([]);

        $this->browser->request('GET', '/login-saml');

        self::assertSame(401, $this->browser->getResponse()->getStatusCode());
        self::assertSame(['message' => 'No credentials provided.'], json_decode((string) $this->browser->getResponse()->getContent(), true, 512, \JSON_THROW_ON_ERROR));
        $this->assertViewer(false);
        $account = $this->reload($id);
        self::assertNull($account->getSamlId());
        self::assertSame($password, $account->getPassword());
        self::assertCount(0, $account->getUserGroups());
    }

    public function testSamlIdentifierTakesPrecedenceOverAnotherAccountsEmail(): void
    {
        $identifier = $this->uniqueEmail();
        $this->samlIdentifier = $identifier;
        $linkedAccount = $this->account()->setSamlId($identifier);
        $linkedId = $linkedAccount->getId();
        $linkedEmail = $linkedAccount->getEmail();
        $emailAccount = $this->account($identifier);
        $emailId = $emailAccount->getId();
        $emailPassword = $emailAccount->getPassword();
        $this->em->flush();
        $this->configureSaml(['email' => [$identifier]]);

        $this->browser->request('GET', '/login-saml');

        self::assertSame(302, $this->browser->getResponse()->getStatusCode());
        self::assertSame('/', $this->browser->getResponse()->headers->get('Location'));
        $this->assertViewer(true, $linkedId);
        $linkedAccount = $this->reload($linkedId);
        self::assertSame($linkedEmail, $linkedAccount->getEmail());
        self::assertSame($identifier, $linkedAccount->getSamlId());
        self::assertCount(1, $linkedAccount->getUserGroups());
        self::assertSame('SAML', $linkedAccount->getUserGroups()->first()->getGroup()->getTitle());
        $emailAccount = $this->reload($emailId);
        self::assertNull($emailAccount->getSamlId());
        self::assertSame($identifier, $emailAccount->getEmail());
        self::assertSame($emailPassword, $emailAccount->getPassword());
        self::assertCount(0, $emailAccount->getUserGroups());
    }

    /** @return iterable<string, array{string}> */
    public static function accountStates(): iterable
    {
        yield 'new SAML account' => ['new'];
        yield 'local account with the same email' => ['email'];
        yield 'linked account with an updated email' => ['linked'];
    }

    /** @dataProvider identityProviders */
    public function testLoginUsesTheConfiguredIdentityAttribute(string $idp, string $attribute): void
    {
        $account = $this->account();
        $id = $account->getId();
        $email = $account->getEmail();
        $password = $account->getPassword();
        $this->configureSaml([$attribute => [$email], 'unrelated-attribute' => ['other@example.test']], $idp);

        $this->browser->request('GET', '/login-saml');

        self::assertSame(302, $this->browser->getResponse()->getStatusCode());
        self::assertSame('/', $this->browser->getResponse()->headers->get('Location'));
        $this->assertViewer(true, $id);
        $account = $this->reload($id);
        self::assertSame($email, $account->getSamlId());
        self::assertSame($email, $account->getEmail());
        self::assertSame($password, $account->getPassword());
        self::assertCount(1, $account->getUserGroups());
        self::assertSame('SAML', $account->getUserGroups()->first()->getGroup()->getTitle());
    }

    /** @dataProvider identityProviders */
    public function testCharacterizationGapMissingIdentityAttributeReturnsServerError(string $idp, string $attribute): void
    {
        $account = $this->account();
        $id = $account->getId();
        $password = $account->getPassword();
        $this->configureSaml(['unrelated-attribute' => [$account->getEmail()]], $idp);

        $this->browser->request('GET', '/login-saml');

        self::assertSame(500, $this->browser->getResponse()->getStatusCode());
        self::assertStringContainsString($attribute, (string) $this->browser->getResponse()->getContent());
        self::assertStringContainsString('was not found', (string) $this->browser->getResponse()->getContent());

        $this->assertViewer(false);
        $account = $this->reload($id);
        self::assertNull($account->getSamlId());
        self::assertSame($password, $account->getPassword());
        self::assertCount(0, $account->getUserGroups());
    }

    /** @return iterable<string, array{string, string}> */
    public static function identityProviders(): iterable
    {
        yield 'development' => ['dev', 'email'];
        yield 'Grand Est' => ['grandest', 'email'];
        yield 'Lyon 1' => ['univ-lyon1', 'urn:oid:0.9.2342.19200300.100.1.3'];
        yield 'CD59' => ['cd59', 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'];
        yield 'April' => ['april', 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'];
        yield 'Clermont' => ['clermont', 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'];
        yield 'Sorbonne' => ['sorbonne', 'mail'];
    }
}
