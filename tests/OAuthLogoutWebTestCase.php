<?php

namespace Capco\Tests;

use HWI\Bundle\OAuthBundle\OAuth\ResourceOwnerInterface;
use HWI\Bundle\OAuthBundle\Security\Core\Authentication\Token\OAuthToken;

abstract class OAuthLogoutWebTestCase extends IdentityWebTestCase
{
    protected function providerSession(string $provider): \Symfony\Component\HttpFoundation\Session\SessionInterface
    {
        $owner = $this->createStub(ResourceOwnerInterface::class);
        $owner->method('getOption')->willReturn('https://provider.test/logout');
        self::getContainer()->set('hwi_oauth.resource_owner.' . $provider, $owner);
        $user = $this->account();
        $this->login($user->getEmail());
        $user = $this->reload($user->getId());
        $token = new OAuthToken('access-token', $user->getRoles());
        $token->setUser($user);
        $token->setAuthenticated(true);
        $token->setResourceOwnerName($provider);
        $token->setRawToken(['access_token' => 'access-token', 'id_token' => 'identity-token']);
        $session = $this->browser->getRequest()->getSession();
        $session->set('_security_main', serialize($token));
        $session->set('theToken', $token->serialize());
        $session->save();

        return $session;
    }

    /** @return array<int|string, array<mixed>|string> */
    protected function logoutParameters(): array
    {
        self::assertSame(302, $this->browser->getResponse()->getStatusCode());
        $url = $this->browser->getResponse()->headers->get('Location');
        self::assertSame('https://provider.test/logout', strtok($url, '?'));
        parse_str((string) parse_url((string) $url, \PHP_URL_QUERY), $parameters);

        return $parameters;
    }
}
