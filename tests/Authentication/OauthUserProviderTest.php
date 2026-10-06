<?php

declare(strict_types=1);

namespace Capco\Tests\Authentication;

use Capco\AppBundle\Entity\SSO\FranceConnectSSOConfiguration;
use Capco\Tests\OAuthWebTestCase;
use Capco\UserBundle\Entity\User;
use Capco\UserBundle\Security\Core\User\OauthUserProvider;
use HWI\Bundle\OAuthBundle\OAuth\Response\UserResponseInterface;
use HWI\Bundle\OAuthBundle\Security\Core\Authentication\Token\OAuthToken;
use Symfony\Component\HttpFoundation\RequestStack;
use Symfony\Component\Security\Core\Authentication\Token\Storage\TokenStorageInterface;

/**
 * @internal
 * @runTestsInSeparateProcesses
 * @preserveGlobalState disabled
 * @phpunit-status compliant
 * @phpunit-reason Exercises provider claims and account association through HTTP with real persistence and provider transport stubs.
 */
final class OauthUserProviderTest extends OAuthWebTestCase
{
    /** @dataProvider openidEmailClaims */
    public function testOpenidCallbackSelectsTheEmailClaimWithoutLinkingAnUnrelatedAccount(string $instance, string $claim, bool $usesClaim): void
    {
        $localAccount = $this->account();
        $localId = $localAccount->getId();
        $email = $localAccount->getEmail();
        $password = $localAccount->getPassword();
        $this->configureProvider('openid', $email);
        $claims = ['sub' => $this->providerSubject, 'given_name' => 'Provider', 'family_name' => 'Person', $claim => $email];
        $this->providerResponses['/openid/userinfo'] = $claims;

        $this->completeLogin('openid');

        $account = $this->providerAccount('openId');
        if ($usesClaim) {
            self::assertSame($localId, $account->getId());
        }
        self::assertSame($usesClaim ? $email : null, $account->getEmail());
        self::assertSame($this->providerSubject, $account->getOpenId());
        self::assertSame('provider-access-token', $account->getOpenIdAccessToken());
        self::assertSame(['SSO', 'SSO openid'], $this->groupTitles($account));
        $this->assertViewer(true, $account->getId());
        $localAccount = $this->reload($localId);
        self::assertSame($email, $localAccount->getEmail());
        self::assertSame($password, $localAccount->getPassword());
        if (!$usesClaim) {
            self::assertNotSame($localId, $account->getId());
            self::assertNull($localAccount->getOpenId());
            self::assertCount(0, $localAccount->getUserGroups());
        }
    }

    /** @return iterable<string, array{instance: string, claim: string, usesClaim: bool}> */
    public static function openidEmailClaims(): iterable
    {
        yield 'standard email' => ['instance' => 'dev', 'claim' => 'email', 'usesClaim' => true];
        yield 'Red Hat mail fallback' => ['instance' => 'dev', 'claim' => 'mail', 'usesClaim' => true];
        yield 'CATP other email fallback' => ['instance' => 'catp', 'claim' => 'other email', 'usesClaim' => true];
        yield 'other email ignored outside CATP' => ['instance' => 'dev', 'claim' => 'other email', 'usesClaim' => false];
    }

    /** @dataProvider catpInstance */
    public function testCatpCallbackPrefersThePrimaryEmailOverTheAlternativeEmail(string $instance): void
    {
        $primary = $this->account();
        $alternative = $this->account();
        $primaryId = $primary->getId();
        $alternativeId = $alternative->getId();
        $this->configureProvider('openid', $primary->getEmail());
        $this->providerResponses['/openid/userinfo']['other email'] = $alternative->getEmail();

        $this->completeLogin('openid');

        $account = $this->providerAccount('openId');
        self::assertSame($primaryId, $account->getId());
        $this->assertViewer(true, $primaryId);
        $alternative = $this->reload($alternativeId);
        self::assertNull($alternative->getOpenId());
        self::assertCount(0, $alternative->getUserGroups());
    }

    /** @return iterable<string, array{instance: string}> */
    public static function catpInstance(): iterable
    {
        yield 'CATP' => ['instance' => 'catp'];
    }

    /** @dataProvider openidTokenClaims */
    public function testOpenidCallbackPersistsTheTokenSelectedForTheInstance(string $instance, string $expectedToken): void
    {
        $email = $this->uniqueEmail();
        $this->configureProvider('openid', $email);
        $idToken = $this->unsignedClaims(['sub' => $this->providerSubject, 'email' => $email, 'given_name' => 'Provider', 'family_name' => 'Person']);
        $this->providerResponses['/openid/token'] = ['id_token' => $idToken, 'access_token' => 'provider-access-token'];

        $this->completeLogin('openid');

        $account = $this->providerAccount('openId');
        self::assertSame($email, $account->getEmail());
        self::assertSame('id_token' === $expectedToken ? $idToken : 'provider-access-token', $account->getOpenIdAccessToken());
        $this->assertViewer(true, $account->getId());
    }

    /** @return iterable<string, array{instance: string, expectedToken: string}> */
    public static function openidTokenClaims(): iterable
    {
        yield 'standard access token' => ['instance' => 'dev', 'expectedToken' => 'access_token'];
        yield 'CATP ID token priority' => ['instance' => 'catp', 'expectedToken' => 'id_token'];
    }

    /** @dataProvider openidRefreshPolicies */
    public function testOpenidReconnectionRespectsTheProfileRefreshPolicy(string $instance, bool $refreshes): void
    {
        $account = $this->account()->setOpenId($this->providerSubject)->setUsername('Local profile');
        $id = $account->getId();
        $localEmail = $account->getEmail();
        $password = $account->getPassword();
        $this->em->flush();
        $providerEmail = $this->uniqueEmail();
        $this->configureProvider('openid', $providerEmail);

        $this->completeLogin('openid');

        $account = $this->reload($id);
        self::assertSame($refreshes ? $providerEmail : $localEmail, $account->getEmail());
        self::assertSame('Local profile', $account->getUsername());
        self::assertSame($password, $account->getPassword());
        self::assertSame('provider-access-token', $account->getOpenIdAccessToken());
        $this->assertViewer(true, $id);
    }

    /** @return iterable<string, array{instance: string, refreshes: bool}> */
    public static function openidRefreshPolicies(): iterable
    {
        yield 'standard profile preserved' => ['instance' => 'dev', 'refreshes' => false];
        yield 'CATP email refreshed' => ['instance' => 'catp', 'refreshes' => true];
    }

    public function testFacebookCallbackCreatesAnAccountWithoutAnEmailClaim(): void
    {
        $this->configureProvider('facebook', $this->uniqueEmail());
        unset($this->providerResponses['/v8.0/me']['email']);

        $this->completeLogin('facebook');

        $account = $this->providerAccount('facebook_id');
        self::assertNull($account->getEmail());
        self::assertSame('Provider Person', $account->getUsername());
        self::assertSame('provider-access-token', $account->getFacebookAccessToken());
        self::assertTrue($account->isEnabled());
        self::assertSame(['SSO', 'SSO facebook'], $this->groupTitles($account));
        $this->assertViewer(true, $account->getId());
    }

    /** @dataProvider openidAssociations */
    public function testOpenidAssociationMovesTheProviderIdentityAndPreservesBothLocalAccounts(string $instance, string $claim, bool $usesIdToken): void
    {
        $previous = $this->account();
        $previousId = $previous->getId();
        $previousEmail = $previous->getEmail();
        $previousPassword = $previous->getPassword();
        $current = $this->account();
        $currentId = $current->getId();
        $currentEmail = $current->getEmail();
        $currentPassword = $current->getPassword();
        // Without a matching identity, association must find the previous account by its provider email.
        if ('subject' === $claim) {
            $previous->setOpenId($this->providerSubject)->setOpenIdAccessToken('previous-token');
        }
        $this->em->flush();
        $this->configureProvider('openid', $previousEmail);
        $claims = ['sub' => $this->providerSubject, 'given_name' => 'Provider', 'family_name' => 'Person'];
        $claims['subject' === $claim ? 'email' : $claim] = 'sub' === $claim ? $this->providerSubject : $previousEmail;
        if ('sub' === $claim) {
            $previous->setEmail($this->providerSubject);
            $previousEmail = $previous->getEmail();
            $this->em->flush();
        }
        $this->providerResponses['/openid/userinfo'] = $claims;
        $idToken = $this->unsignedClaims($claims);
        if ($usesIdToken) {
            $this->providerResponses['/openid/token']['id_token'] = $idToken;
        }

        $this->associateProvider('openid', $current);

        $current = $this->reload($currentId);
        self::assertSame($this->providerSubject, $current->getOpenId());
        self::assertSame($usesIdToken ? $idToken : 'provider-access-token', $current->getOpenIdAccessToken());
        self::assertSame($currentEmail, $current->getEmail());
        self::assertSame($currentPassword, $current->getPassword());
        $previous = $this->reload($previousId);
        self::assertNull($previous->getOpenId());
        self::assertNull($previous->getOpenIdAccessToken());
        self::assertSame($previousEmail, $previous->getEmail());
        self::assertSame($previousPassword, $previous->getPassword());
        $this->assertViewer(true, $currentId);
    }

    /** @return iterable<string, array{instance: string, claim: string, usesIdToken: bool}> */
    public static function openidAssociations(): iterable
    {
        yield 'CATP other email lookup' => ['instance' => 'catp', 'claim' => 'other email', 'usesIdToken' => false];
        yield 'CATP ID token association' => ['instance' => 'catp', 'claim' => 'subject', 'usesIdToken' => true];
        yield 'standard subject fallback' => ['instance' => 'dev', 'claim' => 'sub', 'usesIdToken' => false];
    }

    /** @dataProvider franceConnectMappings */
    public function testFranceConnectCallbackMapsOnlyAllowedClaimsAndPreservesTheLocalProfile(bool $existing, ?string $preferredUsername): void
    {
        $email = $this->uniqueEmail();
        $existingId = null;
        $password = null;
        if ($existing) {
            $account = $this->account($email)->setUsername('Local profile')->setDateOfBirth(new \DateTime('1990-10-10 00:00:00'));
            $existingId = $account->getId();
            $password = $account->getPassword();
            $this->em->flush();
        }
        $this->configureProvider('franceconnect', $email);
        $configuration = $this->em->getRepository(FranceConnectSSOConfiguration::class)->find('franceConnect');
        $configuration->setAllowedData(['given_name' => true, 'family_name' => true, 'birthdate' => !$existing, 'gender' => true, 'email' => true, 'preferred_username' => null !== $preferredUsername]);
        $this->em->flush();
        $this->providerResponses['/franceconnect/userinfo'] = ['sub' => $this->providerSubject, 'given_name' => 'tOTO', 'family_name' => 'ala', 'email' => $email, 'birthdate' => '1992-12-12', 'gender' => 'male', 'preferred_username' => $preferredUsername];

        $this->completeLogin('franceconnect');

        $account = $this->providerAccount('franceConnectId');
        self::assertSame('Toto', $account->getFirstName());
        self::assertSame('ala', $account->getLastName());
        self::assertSame($existing ? 'Local profile' : ($preferredUsername ?? 'tOTO ala'), $account->getUsername());
        self::assertSame('m', $account->getGender());
        self::assertSame($email, $account->getEmail());
        self::assertSame($existing ? '1990-10-10' : '1992-12-12', $account->getDateOfBirth()?->format('Y-m-d'));
        if ($existing) {
            self::assertSame($existingId, $account->getId());
            self::assertSame($password, $account->getPassword());
        }
        $this->assertViewer(true, $account->getId());
    }

    /** @return iterable<string, array{bool, ?string}> */
    public static function franceConnectMappings(): iterable
    {
        yield 'generated display name' => [false, null];
        yield 'preferred username' => [false, 'toto_fc_username'];
        yield 'local profile and disabled birthday claim preserved' => [true, 'toto_fc_username'];
    }

    public function testFranceConnectAssociationWithAnotherEmailPreservesBothAccountsAndRequestsProviderLogout(): void
    {
        $current = $this->account();
        $currentId = $current->getId();
        $currentEmail = $current->getEmail();
        $currentPassword = $current->getPassword();
        $previous = $this->account()->setFranceConnectId($this->providerSubject)->setFranceConnectAccessToken('previous-token');
        $previousId = $previous->getId();
        $previousEmail = $previous->getEmail();
        $this->em->flush();
        $this->configureProvider('franceconnect', $previousEmail);

        $this->associateProvider('franceconnect', $current);

        $current = $this->reload($currentId);
        self::assertNull($current->getFranceConnectId());
        self::assertNull($current->getFranceConnectAccessToken());
        self::assertSame($currentEmail, $current->getEmail());
        self::assertSame($currentPassword, $current->getPassword());
        $previous = $this->reload($previousId);
        self::assertSame($this->providerSubject, $previous->getFranceConnectId());
        self::assertSame('previous-token', $previous->getFranceConnectAccessToken());
        self::assertSame($previousEmail, $previous->getEmail());
        $this->assertViewer(true, $currentId);
        self::assertNotEmpty($this->browser->getRequest()->getSession()->getFlashBag()->peek('danger'));
        $this->browser->request('GET', '/projects');
        self::assertSame(302, $this->browser->getResponse()->getStatusCode());
        $location = (string) $this->browser->getResponse()->headers->get('Location');
        self::assertSame('https://provider.test/franceconnect/logout', strtok($location, '?'));
        parse_str((string) parse_url($location, \PHP_URL_QUERY), $parameters);
        self::assertSame('https://capco.test/', $parameters['post_logout_redirect_uri']);
        self::assertSame($this->providerResponses['/franceconnect/token']['id_token'], $parameters['id_token_hint']);
    }

    public function testExpiredFranceConnectProviderResponseDoesNotAssociateTheAccount(): void
    {
        $account = $this->account();
        $id = $account->getId();
        $email = $account->getEmail();
        $password = $account->getPassword();
        $this->configureProvider('franceconnect', $email);
        $this->providerResponses['/franceconnect/userinfo']['status'] = 'fail';
        $this->providerResponses['/franceconnect/userinfo']['message'] = 'token_not_found_or_expired';

        $this->associateProvider('franceconnect', $account);

        $account = $this->reload($id);
        self::assertNull($account->getFranceConnectId());
        self::assertNull($account->getFranceConnectAccessToken());
        self::assertSame($email, $account->getEmail());
        self::assertSame($password, $account->getPassword());
        self::assertCount(0, $account->getUserGroups());
        self::assertNotEmpty($this->browser->getRequest()->getSession()->getFlashBag()->peek('danger'));
        $this->assertViewer(true, $id);
    }

    /**
     * @dataProvider publicFranceConnectMappings
     * @phpunit-status non-compliant
     * @phpunit-reason Uses a kernel to obtain the real authentication service for its public mapping rule; no persistence is claimed.
     */
    public function testPublicFranceConnectMappingPreservesLocalValuesAndGeneratesTheDisplayName(bool $existing, bool $preferredUsername): void
    {
        $user = new User();
        if ($existing) {
            $user->setEmail('local@example.test')->setUsername('Local profile')->setDateOfBirth(new \DateTime('1990-10-10 00:00:00'));
        }
        $response = $this->createStub(UserResponseInterface::class);
        $response->method('getData')->willReturn(['given_name' => 'tOTO', 'family_name' => 'ala', 'email' => 'provider@example.test', 'birthdate' => '1992-12-12', 'gender' => 'male', 'preferred_username' => 'provider_username']);

        $mapped = self::getContainer()->get(OauthUserProvider::class)->mapFranceConnectData($user, $response, ['given_name' => true, 'family_name' => true, 'birthdate' => !$existing, 'gender' => true, 'email' => true, 'preferred_username' => $preferredUsername]);

        self::assertSame($user, $mapped);
        self::assertSame('Toto', $user->getFirstName());
        self::assertSame('ala', $user->getLastName());
        self::assertSame($existing ? 'Local profile' : ($preferredUsername ? 'provider_username' : 'ala Toto'), $user->getUsername());
        self::assertSame($existing ? 'local@example.test' : 'provider@example.test', $user->getEmail());
        self::assertSame('m', $user->getGender());
        self::assertSame($existing ? '1990-10-10' : '1992-12-12', $user->getDateOfBirth()?->format('Y-m-d'));
    }

    /** @return iterable<string, array{bool, bool}> */
    public static function publicFranceConnectMappings(): iterable
    {
        yield 'generated display name' => [false, false];
        yield 'preferred username' => [false, true];
        yield 'local email, display name and birthday preserved' => [true, true];
    }

    /**
     * @phpunit-status non-compliant
     * @phpunit-reason Characterizes a malformed response rejected before the HTTP callback; invokes the public provider directly with real persistence.
     */
    public function testMalformedFranceConnectResponseWithoutTokenOrSubjectStillCreatesAnAccount(): void
    {
        $email = $this->uniqueEmail();
        $this->configureProvider('franceconnect', $email);
        $parameters = $this->beginLogin('franceconnect');
        $this->setProviderNonce($parameters['nonce']);
        $this->browser->getRequest()->query->set('state', $parameters['state']);
        $response = $this->createStub(UserResponseInterface::class);
        $response->method('getResourceOwner')->willReturn(self::getContainer()->get('hwi_oauth.resource_owner.franceconnect'));
        $token = $this->createStub(OAuthToken::class);
        $token->method('getRawToken')->willReturn(['id_token' => $this->providerResponses['/franceconnect/token']['id_token']]);
        $response->method('getOAuthToken')->willReturn($token);
        $response->method('getData')->willReturn(['given_name' => 'Jean Jacques', 'family_name' => 'GoldMan', 'email' => $email, 'preferred_username' => 'JJ']);
        $response->method('getEmail')->willReturn($email);
        $response->method('getNickname')->willReturn('JJ');

        $requests = self::getContainer()->get(RequestStack::class);
        $requests->push($this->browser->getRequest());
        $tokens = self::getContainer()->get(TokenStorageInterface::class);
        $originalToken = $tokens->getToken();
        $tokens->setToken(null);
        $this->unlinkedProviderEmails[] = $email;

        try {
            $account = self::getContainer()->get(OauthUserProvider::class)->loadUserByOAuthUserResponse($response);
        } finally {
            $tokens->setToken($originalToken);
            $requests->pop();
        }

        self::assertInstanceOf(User::class, $account);
        $account = $this->reload($account->getId());
        self::assertSame($email, $account->getEmail());
        self::assertNull($account->getFranceConnectId());
        self::assertNull($account->getFranceConnectAccessToken());
        self::assertSame('Jean jacques', $account->getFirstName());
        self::assertSame('GoldMan', $account->getLastName());
    }

    private function completeLogin(string $provider): void
    {
        $parameters = $this->beginLogin($provider);
        $this->setProviderNonce($parameters['nonce']);
        $this->browser->request('GET', '/login/check-' . $provider . '?' . http_build_query(['code' => 'authorization-code', 'state' => $parameters['state'], '_destination' => '/projects']));
        self::assertSame(302, $this->browser->getResponse()->getStatusCode(), (string) $this->browser->getResponse()->getContent());
        self::assertSame('https://capco.test/projects', $this->browser->getResponse()->headers->get('Location'));
    }

    private function associateProvider(string $provider, User $current): void
    {
        $this->browser->loginUser($current);
        $parameters = $this->beginLogin($provider, true);
        $this->setProviderNonce($parameters['nonce']);
        $crawler = $this->browser->request('GET', '/login/service/' . $provider . '?' . http_build_query(['code' => 'authorization-code', 'state' => $parameters['state']]));
        self::assertSame(200, $this->browser->getResponse()->getStatusCode(), (string) $this->browser->getResponse()->getContent());
        // Submit the real confirmation form, including the CSRF token supplied over HTTP.
        $this->browser->submit($crawler->filter('form')->form());
        self::assertSame(302, $this->browser->getResponse()->getStatusCode(), (string) $this->browser->getResponse()->getContent());
        self::assertSame('/projects', $this->browser->getResponse()->headers->get('Location'));
    }

    private function providerAccount(string $field): User
    {
        $this->em->clear();
        $accounts = $this->em->getRepository(User::class)->findBy([$field => $this->providerSubject]);
        self::assertCount(1, $accounts);

        return $accounts[0];
    }

    /** @param array<string, mixed> $claims */
    private function unsignedClaims(array $claims): string
    {
        return base64_encode('{"alg":"none"}') . '.' . base64_encode(json_encode($claims, \JSON_THROW_ON_ERROR)) . '.fixture';
    }
}
