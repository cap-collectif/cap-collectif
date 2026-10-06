<?php

namespace Capco\Tests\UserBundle\Security;

use Capco\Tests\OAuthLogoutWebTestCase;

/**
 * @internal
 * @runTestsInSeparateProcesses
 * @preserveGlobalState disabled
 * @phpunit-status compliant
 * @phpunit-reason Exercises HTTP outcomes and real domain data with transactional cleanup; replaces only external boundaries.
 */
final class OpenIDLogoutHandlerTest extends OAuthLogoutWebTestCase
{
    /** @dataProvider destinations */
    public function testOpenIdLogoutUsesTheConfiguredDestinationAndClearsLocalAuthentication(?string $configured, bool $switch, string $expected): void
    {
        $configuration = $this->em->getRepository(\Capco\AppBundle\Entity\SSO\Oauth2SSOConfiguration::class)->findOneBy([]) ?? new \Capco\AppBundle\Entity\SSO\Oauth2SSOConfiguration();
        $configuration->setEnabled(true)->setDisconnectSsoOnLogout(true)->setPostLogoutRedirectUri($configured)->setClientId('local-client');
        $this->em->persist($configuration);
        $this->em->flush();
        $this->providerSession('openid');
        $this->browser->request('GET', '/logout', $switch ? ['ssoSwitchUser' => true] : []);
        $parameters = $this->logoutParameters();
        self::assertSame($expected, $parameters['post_logout_redirect_uri']);
        self::assertSame('local-client', $parameters['client_id']);
        $this->assertViewer(false);
    }

    /** @return iterable<string, array{?string, bool, string}> */
    public static function destinations(): iterable
    {
        yield 'configured destination' => ['https://capco.test/projects', false, 'https://capco.test/projects'];
        yield 'homepage fallback' => [null, false, 'https://capco.test/'];
        yield 'switch account callback' => ['https://capco.test/projects', true, 'https://capco.test//login/openid?_destination=https://capco.test/'];
    }
}
