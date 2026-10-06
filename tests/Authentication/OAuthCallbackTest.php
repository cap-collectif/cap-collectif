<?php

declare(strict_types=1);

namespace Capco\Tests\Authentication;

use Capco\Tests\OAuthWebTestCase;
use Capco\UserBundle\Entity\User;
use Capco\UserBundle\FranceConnect\FranceConnectOptionsModifier;

/**
 * @internal
 * @runTestsInSeparateProcesses
 * @preserveGlobalState disabled
 * @phpunit-status compliant
 * @phpunit-reason Exercises real OAuth resource owners and account persistence through HTTP with a fixed provider transport.
 */
final class OAuthCallbackTest extends OAuthWebTestCase
{
    /** @dataProvider providers */
    public function testCallbackCreatesAnAccountWithProviderIdentityAndAnAuthenticatedSession(string $provider, bool $v2 = false): void
    {
        $email = $this->uniqueEmail();
        $neighbor = $this->account();
        $neighborId = $neighbor->getId();
        $neighborEmail = $neighbor->getEmail();
        $this->configureProvider($provider, $email, $v2);
        $parameters = $this->beginLogin($provider);
        $this->setProviderNonce($parameters['nonce'] ?? 'unused');

        $this->browser->request('GET', '/login/check-' . $provider . '?' . http_build_query(['code' => 'authorization-code', 'state' => $parameters['state'] ?? '', '_destination' => '/projects']));

        self::assertSame(302, $this->browser->getResponse()->getStatusCode(), (string) $this->browser->getResponse()->getContent());
        self::assertSame('https://capco.test/projects', $this->browser->getResponse()->headers->get('Location'));
        $this->em->clear();
        $account = $this->em->getRepository(User::class)->findOneBy(['email' => $email]);
        self::assertInstanceOf(User::class, $account);
        $id = $account->getId();
        self::assertTrue($account->isEnabled());
        self::assertSame('Provider Person', $account->getUsername());
        $getter = 'get' . ucfirst($provider) . ('openid' === $provider ? '' : 'Id');
        self::assertSame($this->providerSubject, $account->{$getter}());
        $tokenGetter = 'get' . ucfirst($provider) . 'AccessToken';
        self::assertSame('provider-access-token', $account->{$tokenGetter}());
        $groups = [];
        foreach ($account->getUserGroups() as $membership) {
            $groups[] = $membership->getGroup()->getTitle();
        }
        sort($groups);
        self::assertSame(['SSO', 'SSO ' . $provider], $groups);
        if ('franceconnect' === $provider) {
            self::assertSame('Provider', $account->getFirstName());
            self::assertSame('Person', $account->getLastName());
            self::assertSame($this->providerResponses[$v2 ? '/api/v2/token' : '/franceconnect/token']['id_token'], $account->getFranceConnectIdToken());
        }
        $this->assertViewer(true, $id);
        $neighbor = $this->reload($neighborId);
        self::assertSame($neighborEmail, $neighbor->getEmail());
        self::assertNull($neighbor->{$getter}());
        self::assertCount(0, $neighbor->getUserGroups());
    }

    /** @dataProvider existingAccounts */
    public function testCallbackReusesTheLocalAccountWithoutChangingItsPasswordOrDuplicatingMemberships(string $provider, bool $linked, bool $v2 = false): void
    {
        $providerEmail = $this->uniqueEmail();
        $account = $this->account($linked ? $this->uniqueEmail() : $providerEmail)->setUsername('Local profile');
        $id = $account->getId();
        $email = $account->getEmail();
        $password = $account->getPassword();
        $setter = 'set' . ucfirst($provider) . ('openid' === $provider ? '' : 'Id');
        $getter = 'get' . ucfirst($provider) . ('openid' === $provider ? '' : 'Id');
        if ($linked) {
            $account->{$setter}($this->providerSubject);
        }
        $neighbor = $this->account($linked ? $providerEmail : null);
        $neighborId = $neighbor->getId();
        $neighborEmail = $neighbor->getEmail();
        $this->em->flush();
        $this->configureProvider($provider, $providerEmail, $v2);
        // Existing SSO memberships must survive a new provider callback without duplicates.
        $groups = self::getContainer()->get(\Capco\AppBundle\GraphQL\Mutation\GroupMutation::class);
        $groups->createAndAddUserInGroup($account, 'SSO');
        $groups->createAndAddUserInGroup($account, 'SSO ' . $provider);
        $parameters = $this->beginLogin($provider);
        $this->setProviderNonce($parameters['nonce'] ?? 'unused');

        $this->browser->request('GET', '/login/check-' . $provider . '?' . http_build_query(['code' => 'authorization-code', 'state' => $parameters['state'] ?? '', '_destination' => '/projects']));

        self::assertSame(302, $this->browser->getResponse()->getStatusCode());
        self::assertSame('https://capco.test/projects', $this->browser->getResponse()->headers->get('Location'));
        $this->assertViewer(true, $id);
        $account = $this->reload($id);
        self::assertSame($email, $account->getEmail());
        self::assertSame('Local profile', $account->getUsername());
        self::assertSame($password, $account->getPassword());
        self::assertSame($this->providerSubject, $account->{$getter}());
        $tokenGetter = 'get' . ucfirst($provider) . 'AccessToken';
        self::assertSame('provider-access-token', $account->{$tokenGetter}());
        self::assertSame(['SSO', 'SSO ' . $provider], $this->groupTitles($account));
        self::assertCount(1, $this->em->getRepository(User::class)->findBy([match ($provider) {
            'openid' => 'openId', 'facebook' => 'facebook_id', 'franceconnect' => 'franceConnectId', default => throw new \InvalidArgumentException('Unknown provider')
        } => $this->providerSubject]));
        $neighbor = $this->reload($neighborId);
        self::assertSame($neighborEmail, $neighbor->getEmail());
        self::assertNull($neighbor->{$getter}());
        self::assertCount(0, $neighbor->getUserGroups());
    }

    /** @dataProvider callbackFailures */
    public function testFailedCallbackLeavesTheLocalAccountUnlinkedAndTheSessionAnonymous(string $provider, string $failure, string $message, bool $v2 = false): void
    {
        $account = $this->account()->setUsername('Unlinked local profile');
        $id = $account->getId();
        $email = $account->getEmail();
        $password = $account->getPassword();
        $this->em->flush();
        $this->configureProvider($provider, $email, $v2);
        $parameters = $this->beginLogin($provider);
        $this->setProviderNonce($parameters['nonce'] ?? 'unused');
        $callback = ['code' => 'authorization-code', 'state' => $parameters['state'] ?? ''];
        $tokenPath = $v2 ? '/api/v2/token' : ('facebook' === $provider ? '/v8.0/oauth/access_token' : '/' . $provider . '/token');
        $infoPath = $v2 ? '/api/v2/userinfo' : ('facebook' === $provider ? '/v8.0/me' : '/' . $provider . '/userinfo');
        if ('denied' === $failure) {
            $callback['error'] = 'access_denied';
            unset($callback['code']);
        } elseif ('invalid-token' === $failure) {
            $this->providerResponses[$tokenPath] = ['error' => 'invalid_grant'];
        } elseif ('token-network' === $failure) {
            $this->transportFailurePath = $tokenPath;
        } elseif ('userinfo-network' === $failure) {
            $this->transportFailurePath = $infoPath;
        } elseif ('bad-state' === $failure) {
            $callback['state'] = 'foreign-state';
        } elseif ('bad-nonce' === $failure) {
            $this->setProviderNonce('foreign-nonce');
        } elseif ('expired-state' === $failure) {
            $this->providerCache->deleteItem(FranceConnectOptionsModifier::REDIS_FRANCE_CONNECT_TOKENS_CACHE_KEY . '-' . $this->browser->getRequest()->getSession()->getId());
        } elseif ('invalid-signature' === $failure) {
            self::assertIsString($this->providerResponses[$infoPath]);
            $parts = explode('.', $this->providerResponses[$infoPath]);
            $signature = base64_decode(strtr($parts[2], '-_', '+/'));
            $signature[0] = \chr(\ord($signature[0]) ^ 1);
            $parts[2] = rtrim(strtr(base64_encode($signature), '+/', '-_'), '=');
            $this->providerResponses[$infoPath] = implode('.', $parts);
        } elseif ('malformed-userinfo' === $failure) {
            $this->providerResponses[$infoPath] = 'invalid.jwt.fixture';
        } elseif ('expired-userinfo' === $failure) {
            $this->providerResponses[$infoPath] = $this->signedClaims(['sub' => $this->providerSubject, 'email' => $email], self::JWT_NOW - 3600);
        } elseif ('missing-access-token' === $failure) {
            $this->providerResponses[$tokenPath] = ['id_token' => 'provider-id-token'];
        } elseif ('missing-code' === $failure) {
            unset($callback['code']);
        }

        $this->browser->request('GET', '/login/check-' . $provider . '?' . http_build_query($callback));

        self::assertSame(302, $this->browser->getResponse()->getStatusCode());
        self::assertSame('https://capco.test/', $this->browser->getResponse()->headers->get('Location'));
        $error = $this->browser->getRequest()->getSession()->get(\Symfony\Component\Security\Core\Security::AUTHENTICATION_ERROR);
        self::assertInstanceOf(\Symfony\Component\Security\Core\Exception\AuthenticationException::class, $error);
        self::assertSame($message, $error->getMessage());
        $this->assertViewer(false);
        $account = $this->reload($id);
        $getter = 'get' . ucfirst($provider) . ('openid' === $provider ? '' : 'Id');
        self::assertNull($account->{$getter}());
        self::assertSame($email, $account->getEmail());
        self::assertSame('Unlinked local profile', $account->getUsername());
        self::assertSame($password, $account->getPassword());
        self::assertCount(0, $account->getUserGroups());
        self::assertSame([$id], array_map(static fn (User $user): string => $user->getId(), $this->em->getRepository(User::class)->findBy(['email' => $email])));
    }

    /** @return iterable<string, array{string, bool, bool}> */
    public static function existingAccounts(): iterable
    {
        foreach (['openid', 'facebook', 'franceconnect'] as $provider) {
            yield $provider . ' email collision' => [$provider, false, false];
            yield $provider . ' linked account with a changed local email' => [$provider, true, false];
        }
        yield 'FranceConnect v2 email collision' => ['franceconnect', false, true];
        yield 'FranceConnect v2 linked account with changed email' => ['franceconnect', true, true];
    }

    /** @return iterable<string, array{string, string, string, bool}> */
    public static function callbackFailures(): iterable
    {
        foreach (['openid', 'facebook', 'franceconnect'] as $provider) {
            yield $provider . ' refusal' => [$provider, 'denied', 'franceconnect' === $provider ? 'La connexion via FranceConnect a été refusée. Veuillez réessayer ou utiliser un autre mode de connexion.' : 'No oauth code in the request.', false];
            yield $provider . ' invalid grant' => [$provider, 'invalid-token', 'OAuth error: "invalid_grant"', false];
            yield $provider . ' token endpoint unavailable' => [$provider, 'token-network', 'Error while sending HTTP request', false];
            yield $provider . ' userinfo endpoint unavailable' => [$provider, 'userinfo-network', 'Error while sending HTTP request', false];
            yield $provider . ' missing authorization code' => [$provider, 'missing-code', 'No oauth code in the request.', false];
        }
        yield 'OpenID ID token without access token' => ['openid', 'missing-access-token', 'Not a valid access token.', false];
        yield 'FranceConnect v2 malformed userinfo' => ['franceconnect', 'malformed-userinfo', 'FranceConnect token verification failed.', true];
        yield 'FranceConnect v2 userinfo unavailable' => ['franceconnect', 'userinfo-network', 'Error while retrieving information from FranceConnect.', true];
        yield 'FranceConnect v2 foreign nonce' => ['franceconnect', 'bad-nonce', 'Erreur lors de la connexion à FranceConnect', true];
        yield 'FranceConnect v2 invalid signature' => ['franceconnect', 'invalid-signature', 'FranceConnect signature verification failed.', true];
        yield 'FranceConnect v2 expired userinfo' => ['franceconnect', 'expired-userinfo', 'FranceConnect token expired.', true];
        yield 'FranceConnect foreign state' => ['franceconnect', 'bad-state', 'Given CSRF token is not valid.', false];
        yield 'FranceConnect foreign nonce' => ['franceconnect', 'bad-nonce', 'Erreur lors de la connexion à FranceConnect', false];
        yield 'FranceConnect expired state' => ['franceconnect', 'expired-state', 'Erreur lors de la connexion à FranceConnect', false];
    }

    /** @return iterable<string, array{string, bool}> */
    public static function providers(): iterable
    {
        yield 'OpenID' => ['openid', false];
        yield 'Facebook' => ['facebook', false];
        yield 'FranceConnect v1' => ['franceconnect', false];
        yield 'FranceConnect v2' => ['franceconnect', true];
    }
}
