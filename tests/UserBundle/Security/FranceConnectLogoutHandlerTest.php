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
final class FranceConnectLogoutHandlerTest extends OAuthLogoutWebTestCase
{
    /** @dataProvider logoutModes */
    public function testFranceConnectLogoutForwardsItsIdentityTokenOnlyWhenEnabled(bool $enabled, bool $stored): void
    {
        $this->setFeature('login_franceconnect', $enabled);
        $session = $this->providerSession('franceconnect');
        if ($stored) {
            $user = $this->account();
            $this->browser->loginUser($user);
            $session = self::getContainer()->get('session');
            $session->set(\Capco\UserBundle\Security\Http\Logout\Handler\FranceConnectLogoutHandler::SESSION_LOGOUT_REQUIRED_KEY, true);
            $session->set(\Capco\UserBundle\Security\Http\Logout\Handler\FranceConnectLogoutHandler::SESSION_ID_TOKEN_KEY, 'stored-token');
            $session->save();
        }
        $this->browser->request('GET', '/logout', [], [], ['HTTP_REFERER' => '/']);
        if ($enabled) {
            $parameters = $this->logoutParameters();
            self::assertSame($stored ? 'stored-token' : 'identity-token', $parameters['id_token_hint']);
            self::assertSame('https://capco.test/', $parameters['post_logout_redirect_uri']);
            self::assertNotEmpty($parameters['state']);
        } else {
            self::assertSame('/', $this->browser->getResponse()->headers->get('Location'));
        }
        $this->assertViewer(false);
    }

    /** @return iterable<string, array{bool, bool}> */
    public static function logoutModes(): iterable
    {
        yield 'provider token' => [true, false];
        yield 'disabled' => [false, false];
        yield 'stored credentials' => [true, true];
    }
}
